
# Bookmarks Dashboard — Minimal New Tab Bookmark Manager

A clean and minimal Chrome New Tab dashboard that organizes your browser bookmarks into categorized columns. It includes a live clock, date and greeting, instant bookmark search, automatic light/dark themes, and a built-in notepad.

This project is a **modified and simplified version of [StartDock](https://github.com/sumedhe/startdock)**, with selected functionality removed and changes made to suit this project's intended use.

## Credits & Original Project

This project is based on [StartDock](https://github.com/sumedhe/startdock), originally created by [sumedhe](https://github.com/sumedhe).

The original project has been modified to create a simplified bookmarks dashboard. Selected functionality has been removed, and the remaining interface and behavior have been adapted for this version.

- **Original project:** https://github.com/sumedhe/startdock
- **Original author:** [sumedhe](https://github.com/sumedhe)
- **Modified version:** Bookmarks Dashboard

Credit for the original project belongs to its original author. Please review the original repository's license and retain any attribution or notices required by its terms.

## Features

- **Custom New Tab Page:** Replaces Chrome's default New Tab page with a bookmark dashboard.
- **Automatic Bookmark Organization:** Reads native browser bookmarks and groups them into columns based on bookmark folders.
- **Bookmark Search:** Instantly filter bookmarks by name.
- **Live Clock:** Displays the current time, including seconds.
- **Date Display:** Shows the current day, month, and year.
- **Dynamic Greeting:** Displays Good morning, Good afternoon, or Good evening based on the local time.
- **Bookmark Statistics:** Displays the total number of bookmarks and categories.
- **System-Aware Theme:** Automatically adapts to the operating system's light or dark appearance preference.
- **Built-in Notepad:** Write and retain notes directly on the New Tab page.
- **Automatic Note Saving:** Saves notepad content in browser local storage as you type.
- **Resizable Notepad:** Adjust the notepad height, with the selected height saved locally.
- **Keyboard Search Shortcut:** Press `/` to focus the bookmark search field.
- **Escape Shortcut:** Press `Esc` to clear and close the active search field.
- **Bookmark Favicons:** Displays website icons alongside bookmark names when available.
- **Responsive Layout:** Adjusts the dashboard layout for smaller screens.
- **Lightweight Implementation:** Uses HTML, CSS, and JavaScript without a build process.

## Requirements

- Google Chrome or a compatible Chromium-based browser.
- JavaScript enabled.
- Permission to install unpacked extensions when installing locally.

## Installation

### Install Using Chrome Developer Mode

1. Download or clone this repository.
2. Extract the ZIP archive if necessary.
3. Open Google Chrome.
4. Navigate to `chrome://extensions/`.
5. Enable **Developer mode**.
6. Click **Load unpacked**.
7. Select the project folder containing `manifest.json`.

After installation, open a new tab to view the dashboard.

No build process or package installation is required.

## How to Use

### Browse Your Bookmarks

Open a new tab. Your browser bookmarks are automatically read and displayed in categorized columns based on the existing bookmark folders.

Click a bookmark to open its website.

### Search Bookmarks

Use the search field in the dashboard to filter bookmarks by name.

You can also press `/` to focus the search field.

Press `Esc` while the search field is focused to clear the search and remove focus.

### Use the Built-in Notepad

Type notes into the Notepad panel.

The extension automatically saves the text in the browser's local storage. Your saved text is restored when the dashboard is opened again in the same browser profile.

You can also resize the notepad vertically. Its height is saved locally.

**Note:** The notepad uses local storage rather than Chrome's synchronized storage. Its content is not automatically synchronized across devices.

### Switch Between Light and Dark Themes

The dashboard automatically follows your operating system's appearance preference.

- Light appearance: displays the light theme.
- Dark appearance: displays the dark theme.

The theme is controlled through the CSS `prefers-color-scheme` media query.

### View Bookmark Statistics

The dashboard displays the total number of bookmarks and categories generated from the browser's bookmark tree.

The clock, date, and greeting update automatically.

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `/` | Focus the bookmark search field |
| `Esc` | Clear the search and remove focus when the search field is active |

## Project Structure

```text
bookmarks-dashboard/
├── manifest.json
├── New Tab.htm
├── script.js
├── style.css
└── icon.png
```

### File Descriptions

| File | Purpose |
|---|---|
| `manifest.json` | Defines the extension metadata, permissions, icons, and New Tab override. |
| `New Tab.htm` | Contains the dashboard's HTML structure, clock, search field, statistics, and grid container. |
| `script.js` | Reads bookmarks, creates categories, renders the dashboard, manages search, updates the clock, and saves notepad content. |
| `style.css` | Defines the dashboard layout, colors, responsive styling, bookmark cards, and light/dark themes. |
| `icon.png` | Provides the extension icon. |

## How It Works

### 1. New Tab Override

The extension uses Chrome's `chrome_url_overrides` setting to replace the default New Tab page with `New Tab.htm`.

### 2. Native Bookmark Access

The extension requests the `bookmarks` permission and uses the Chrome Bookmarks API to retrieve the browser's bookmark tree.

Top-level bookmark folders are converted into dashboard categories. Nested folders are flattened into the corresponding category, and bookmarks are displayed as clickable links.

### 3. Bookmark Search

The search field filters displayed bookmarks by their names as you type. Categories without matching bookmarks are hidden.

### 4. Clock and Date

The dashboard displays the current local time and date. The greeting changes according to the current local hour.

### 5. Notepad Storage

The notepad saves its content in `localStorage` under the key `bookmark-list-text`.

Its height is stored separately under `bookmark-list-text-height`.

This allows the dashboard to restore the notepad content and height when it is opened again in the same browser profile.

### 6. Automatic Theme Selection

The stylesheet uses the `prefers-color-scheme` media query to select light or dark theme variables based on the operating system's appearance preference.

## Permissions

The extension requests the following Chrome permission:

| Permission | Purpose |
|---|---|
| `bookmarks` | Reads the browser's bookmark tree to populate the dashboard. |

The extension uses browser local storage for the notepad and its saved height. This is the webpage's `localStorage`, not `chrome.storage`.

## Privacy

The extension reads browser bookmarks to display them on the dashboard.

The built-in notepad stores its content locally in the browser profile.

Website favicons are requested from Google's favicon service using the relevant website domain. This means favicon requests may disclose the requested domain to that service.

The supplied source does not implement a cloud account or remote synchronization system for bookmarks or notepad content.

## Troubleshooting

### The Dashboard Does Not Appear

- Confirm that the extension is enabled in `chrome://extensions/`.
- Check that `manifest.json` is valid.
- Reload the extension and open a new tab.
- Inspect the page console for JavaScript errors.

### Bookmarks Are Missing

- Confirm that the browser contains bookmarks.
- Check that the extension has the required `bookmarks` permission.
- Reload the dashboard after changing browser bookmarks.

### Bookmark Search Returns No Results

The search filters bookmarks by their displayed names, not by their URLs.

Try searching for a word contained in the bookmark title.

### The Theme Does Not Change

The dashboard follows the operating system's appearance preference through `prefers-color-scheme`.

Change the system appearance setting and reopen or refresh the dashboard.

### Notepad Content Is Missing

The notepad uses local storage associated with the browser profile and extension page origin.

Clearing browser data or local storage may remove saved notes.

## Known Limitations

- The dashboard uses the browser's existing bookmark structure; it does not provide a dedicated bookmark editor.
- Bookmark categories are generated from the native bookmark tree.
- Search matches bookmark names rather than URLs.
- The notepad is stored locally and does not synchronize across devices.
- Website favicons depend on an external favicon service.
- The extension does not include a dedicated settings page.
- The supplied project does not include a build process or automated test suite.

## Contributing

Suggestions, bug reports, and improvements are welcome.

When reporting an issue, include:

- Your browser and version.
- Steps to reproduce the issue.
- Relevant console errors, if available.

When submitting a pull request, describe the change and explain how it was tested.

## License

This repository is a modified version of [StartDock](https://github.com/sumedhe/startdock).

Review the original project's license before redistributing this modified version. Preserve any required attribution, copyright notices, and license terms.

No separate license file was included with the supplied project. Do not assume that removing or modifying functionality changes the licensing obligations of the original code.
