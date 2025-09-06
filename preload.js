const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  startTask: (task) => ipcRenderer.invoke("start-task", task),
  getAllBrowsers: () => ipcRenderer.invoke("get-all-browsers"),
  saveBrowser: (browser) => ipcRenderer.invoke("save-browser", browser),
  getBrowser: () => ipcRenderer.invoke("get-browser"),
});
