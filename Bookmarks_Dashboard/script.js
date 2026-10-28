"use strict";

/* ── Native bookmark helpers ── */
const CATEGORY_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#64748B",
];

function flattenNode(node, pathParts, showPath) {
  const bookmarks = [];
  if (!node.children) return bookmarks;
  for (const child of node.children) {
    if (child.url) {
      const pathLabel = pathParts.filter(Boolean).join(" / ");
      const name =
        showPath && pathLabel
          ? pathLabel + " / " + (child.title || child.url)
          : child.title || child.url;
      bookmarks.push({ name, url: child.url });
    } else {
      const nextPath = child.title ? [...pathParts, child.title] : pathParts;
      bookmarks.push(...flattenNode(child, nextPath, showPath));
    }
  }
  return bookmarks;
}

function nativeBookmarksToCategories(tree, showPath) {
  const categories = [];
  let colorIdx = 0;

  function processRoot(rootNode) {
    if (!rootNode.children) return;
    const directBookmarks = rootNode.children
      .filter((c) => c.url)
      .map((c) => ({ name: c.title || c.url, url: c.url }));
    if (directBookmarks.length > 0) {
      categories.push({
        name: rootNode.title,
        color: CATEGORY_COLORS[colorIdx++ % CATEGORY_COLORS.length],
        bookmarks: directBookmarks,
      });
    }
    rootNode.children
      .filter((c) => !c.url)
      .forEach((folder) => {
        const bookmarks = flattenNode(folder, [], showPath);
        if (bookmarks.length > 0) {
          categories.push({
            name: folder.title || "Folder",
            color: CATEGORY_COLORS[colorIdx++ % CATEGORY_COLORS.length],
            bookmarks,
          });
        }
      });
  }

  if (tree[0] && tree[0].children) {
    tree[0].children.forEach(processRoot);
  }
  return categories;
}

function loadNativeBookmarks(showPath) {
  return new Promise((resolve) => {
    if (!chrome.bookmarks) {
      resolve(null);
      return;
    }
    chrome.bookmarks.getTree((tree) => {
      if (chrome.runtime.lastError || !tree) {
        resolve(null);
        return;
      }
      resolve(nativeBookmarksToCategories(tree, showPath));
    });
  });
}

/* ── Utilities ── */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function faviconUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return "";
  }
}

/* ── Render ── */
function renderGrid(categories, maxVisible) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  grid.insertAdjacentHTML("beforeend", `
  <div class="column" style="--accent: #8B5CF6; --accent-rgb: 59, 130, 246; animation-delay: 0ms;">
    <div class="column-header">
      <span class="column-dot"></span>
      <h2 class="column-title">Notepad</h2>
      <span class="column-count" style="display: none;"></span>
    </div>

    <div class="bookmark-list" style="padding: 8px; box-sizing: border-box;">
      <textarea
        id="bookmark-text-editor"
        placeholder="Type something here..."
        spellcheck="false"
        style="
          display: block;
          width: 100%;
          height: 160px;
          min-height: 160px;
          box-sizing: border-box;
          padding: 12px;
          margin: 0;
          border: none;
          outline: none;
          resize: vertical;
          background: transparent;
          color: inherit;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
          overflow-wrap: break-word;
          overflow: hidden;
        "
      ></textarea>
    </div>
  </div>
`);

  // Attach auto-save and load logic
  const editor = grid.querySelector("#bookmark-text-editor");

  if (editor) {
    const storageKey = "bookmark-list-text";
    const heightKey = "bookmark-list-text-height";

    // Restore saved text and height
    editor.value = localStorage.getItem(storageKey) || "";

    const savedHeight = localStorage.getItem(heightKey);
    if (savedHeight) {
      editor.style.height = savedHeight;
    }

    // Save text automatically
    editor.addEventListener("input", () => {
      localStorage.setItem(storageKey, editor.value);
    });

    // Save height automatically while resizing
    let resizeTimeout;

    const saveHeight = () => {
      clearTimeout(resizeTimeout);

      resizeTimeout = setTimeout(() => {
        localStorage.setItem(
          heightKey,
          `${editor.offsetHeight}px`
        );
      }, 100);
    };

    // Detect height changes, including mouse and touch resizing
    const resizeObserver = new ResizeObserver(saveHeight);
    resizeObserver.observe(editor);
  }


  categories.forEach((cat, i) => {
    grid.appendChild(buildColumn(cat, i, maxVisible));
  });
}

function buildColumn(cat, index, maxVisible) {
  const rgb = hexToRgb(cat.color);
  const col = document.createElement("div");
  col.className = "column";
  col.style.cssText = `--accent: ${cat.color}; --accent-rgb: ${rgb}; animation-delay: ${index * 40}ms`;

  const header = document.createElement("div");
  header.className = "column-header";
  const bmCount = cat.bookmarks.filter((bm) => bm.type !== "separator").length;
  header.innerHTML = `
    <span class="column-dot"></span>
    <h2 class="column-title">${escHtml(cat.name)}</h2>
    <span class="column-count">${bmCount}</span>
  `;

  const list = document.createElement("div");
  list.className = "bookmark-list";

  const limit = maxVisible && maxVisible > 0 ? maxVisible : null;
  let visibleCount = 0;
  const hiddenItems = [];

  cat.bookmarks.forEach((bm) => {
    const el = buildBookmark(bm);
    if (limit && bm.type !== "separator" && visibleCount >= limit) {
      el.classList.add("hidden");
      hiddenItems.push(el);
    } else {
      if (bm.type !== "separator") visibleCount++;
    }
    list.appendChild(el);
  });

  col.appendChild(header);
  col.appendChild(list);

  if (hiddenItems.length > 0) {
    const expandBtn = document.createElement("button");
    expandBtn.className = "col-expand-btn";
    expandBtn.title = "Show more";
    expandBtn.innerHTML = `<span class="col-expand-icon"></span><span class="col-expand-label">${hiddenItems.length} more</span>`;
    expandBtn.addEventListener("click", () => {
      const expanded = expandBtn.classList.toggle("expanded");
      hiddenItems.forEach((el) => el.classList.toggle("hidden", !expanded));
      expandBtn.querySelector(".col-expand-label").textContent = expanded
        ? "Show less"
        : `${hiddenItems.length} more`;
    });
    col.appendChild(expandBtn);
  }

  return col;
}

function buildBookmark(bm) {
  if (bm.type === "separator") {
    const wrap = document.createElement("div");
    wrap.className = "bookmark-separator";
    if (bm.label) {
      wrap.classList.add("bookmark-separator--labeled");
      wrap.innerHTML = `<span>${escHtml(bm.label)}</span>`;
    }
    return wrap;
  }
  const a = document.createElement("a");
  a.className = "bookmark-item";
  a.href = bm.url;
  a.innerHTML = `
    <img class="favicon" src="${faviconUrl(bm.url)}" alt="" loading="lazy" onerror="this.style.display='none'">
    <span class="bookmark-name">${escHtml(bm.name)}</span>
  `;
  return a;
}

function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function updateStats(categories) {
  const total = categories.reduce(
    (s, c) => s + c.bookmarks.filter((bm) => bm.type !== "separator").length,
    0,
  );
  document.getElementById("bookmark-total").textContent = total;
  document.getElementById("category-total").textContent = categories.length;
}

/* ── Clock & date ── */
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function pad(n) {
  return String(n).padStart(2, "0");
}

function greeting(h) {
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function tick() {
  const now = new Date();
  const h = now.getHours(),
    m = now.getMinutes(),
    s = now.getSeconds();
  document.getElementById("clock-hm").textContent = pad(h) + ":" + pad(m);
  document.getElementById("clock-s").textContent = ":" + pad(s);
  document.getElementById("greeting").textContent = greeting(h);
  document.getElementById("date-line").textContent =
    DAYS[now.getDay()] +
    ", " +
    MONTHS[now.getMonth()] +
    " " +
    now.getDate() +
    ", " +
    now.getFullYear();
}

function initClock() {
  tick();
  setInterval(tick, 1000);
}

/* ── Search ── */
function initSearch() {
  const input = document.getElementById("search");
  const noResults = document.getElementById("no-results");

  function doSearch(q) {
    const term = q.trim().toLowerCase();
    let anyVisible = false;

    document.querySelectorAll(".column").forEach((col) => {
      let colVisible = false;
      col.querySelectorAll(".bookmark-item").forEach((item) => {
        const name = item
          .querySelector(".bookmark-name")
          .textContent.toLowerCase();
        const match = !term || name.includes(term);
        item.classList.toggle("hidden", !match);
        if (match) colVisible = true;
      });
      col.classList.toggle("hidden", !colVisible);
      if (colVisible) anyVisible = true;
    });

    noResults.style.display = !anyVisible && term ? "block" : "none";
    document.getElementById("search-hint").style.display = term ? "none" : "";
  }

  input.addEventListener("input", (e) => doSearch(e.target.value));

  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
      input.select();
    }
    if (e.key === "Escape" && document.activeElement === input) {
      input.value = "";
      doSearch("");
      input.blur();
    }
  });
}

/* ── Init ── */
async function init() {
  const nativeShowPath = false;

  const maxVisible = null;

  const nativeCategories = await loadNativeBookmarks(nativeShowPath);

  let categories = nativeCategories !== null ? nativeCategories : [];

  renderGrid(categories, maxVisible);
  updateStats(categories);
  initClock();
  initSearch();
}

init();
