import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { launch } from "puppeteer";
import {
  detectBrowsers,
  getBrowserFromStore,
  saveBrowserToStore,
  isValidBrowser,
} from "./Utility/browser.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createWindow = () => {
  const win = new BrowserWindow({
    title: "Autopilot X",
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
    },
    menu: null,
    show: false,
  });

  win.maximize();
  win.setMenu(null);
  win.show();
  win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();
});

ipcMain.handle("search-google", async (event, searchTerm) => {
  const selectedBrowser = await getBrowserFromStore();
  if (!selectedBrowser || !isValidBrowser(selectedBrowser)) {
    throw new Error("Invalid or no browser selected");
  }

  const browser = await launch({
    headless: false,
    executablePath: selectedBrowser.path,
    defaultViewport: null,
    ignoreDefaultArgs: ["--enable-automation"],
    waitForInitialPage: true,
  });

  const page = await browser.newPage();
  await page.goto("https://youtube.com", { waitUntil: "domcontentloaded" });
  await page.mouse.move(10, 10);
  await page.waitForSelector('input[name="search_query"]', { visible: true });
  const searchBox = await page.$('input[name="search_query"]');
  const box = await searchBox.boundingBox();
  await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for the click to register
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for the click to register
  for (const char of searchTerm) {
    await page.keyboard.press(char);
  }
  await new Promise((resolve) => setTimeout(resolve, 3000)); // wait for the search results to load
  await page.keyboard.press("Enter");
  const screenshot = await page.screenshot({
    quality: 70,
    type: "jpeg",
    encoding: "base64",
  });
  return {
    screenshot,
    searchTerm,
  };
});

ipcMain.handle("get-all-browsers", () => {
  return detectBrowsers();
});

ipcMain.handle("get-browser", () => {
  return getBrowserFromStore();
});

ipcMain.handle("save-browser", (event, browser) => {
  return saveBrowserToStore(browser);
});
