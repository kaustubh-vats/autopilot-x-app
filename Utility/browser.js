import { platform as _platform } from "os";
import { existsSync } from "fs";
import Store from "./store.js";

const browserNames = ["Chrome", "Chromium", "Edge", "Brave", "Chrome (x86)"];

export function isValidBrowser(browser) {
  return (
    browser &&
    browser.name &&
    browserNames.includes(browser.name) &&
    browser.path &&
    existsSync(browser.path)
  );
}

export function detectBrowsers() {
  const platform = _platform();
  const browsers = [];

  const candidates = {
    win32: [
      {
        name: "Chrome",
        path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      },
      {
        name: "Chrome (x86)",
        path: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      },
      {
        name: "Edge",
        path: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      },
      {
        name: "Brave",
        path: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
      },
    ],
    darwin: [
      {
        name: "Chrome",
        path: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      },
      {
        name: "Edge",
        path: "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      },
      {
        name: "Brave",
        path: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
      },
    ],
    linux: [
      { name: "Chrome", path: "/usr/bin/google-chrome" },
      { name: "Chromium", path: "/usr/bin/chromium-browser" },
      { name: "Edge", path: "/usr/bin/microsoft-edge" },
      { name: "Brave", path: "/usr/bin/brave-browser" },
    ],
  };

  const targets = candidates[platform] || [];

  targets.forEach((browser) => {
    if (isValidBrowser(browser)) {
      browsers.push(browser);
    }
  });

  return browsers;
}

export function getBrowserFromStore() {
  const storedBrowser = Store.get("browser");
  if (isValidBrowser(storedBrowser)) {
    return storedBrowser;
  }
  return null;
}

export function saveBrowserToStore(browser) {
  if (!isValidBrowser(browser)) {
    return false;
  }
  const storeData = getBrowserFromStore() || {};
  storeData.name = browser.name;
  storeData.path = browser.path;
  Store.set("browser", storeData);
  return true;
}

