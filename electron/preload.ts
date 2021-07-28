import {UDPClient} from "./udp_client";
import {contextBridge} from "electron";
import * as Electron from 'electron';

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})

process.once('loaded', () => {
 console.log('loaded process on preload');

});


// contextBridge.exposeInMainWorld('myAPI', {
//   loadPreferences: () => Electron.ipcRenderer.invoke('jsonRetrieveDB')
// })
