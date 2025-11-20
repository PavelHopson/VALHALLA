
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Add any specific Electron capabilities here if needed later
  // e.g. sendNotification: (title, body) => ipcRenderer.send('notify', { title, body })
  platform: process.platform
});
