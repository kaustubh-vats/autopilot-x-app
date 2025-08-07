const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  searchGoogle: (query) => ipcRenderer.invoke("search-google", query),
  getAllBrowsers: () => ipcRenderer.invoke("get-all-browsers"),
  saveBrowser: (browser) => ipcRenderer.invoke("save-browser", browser),
  getBrowser: () => ipcRenderer.invoke("get-browser"),
});
