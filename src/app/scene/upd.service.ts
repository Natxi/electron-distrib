import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron'
import {Observable, of, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UpdService {

  constructor(
    private _electronService: ElectronService,
  ) {}

  connectUDP(ip: string, port: number) {
    if(this._electronService.isElectronApp) {
      console.log('isElectronApp');
      const result = this._electronService.ipcRenderer.sendSync('UDP', {address: ip, port: port});
      console.log('result', result);
    }
  }

  sendUdpCommand(ip: string, port: number, cmd: string) {
    if(this._electronService.isElectronApp) {
      console.log('isElectronApp');
      const result = this._electronService.ipcRenderer.sendSync('UDPSEND', {address: ip, port: port, cmd: cmd});
      console.log('result', result);
    }
  }

  sendUdpObservable(ip: string, port: number, cmd: string): Observable<any> {
    const sub = new Subject();
    if(this._electronService.isElectronApp) {
      console.log('isElectronApp');
      const result = this._electronService.ipcRenderer.sendSync('UDPSEND', {address: ip, port: port, cmd: cmd});
      console.log('result', result);
      this._electronService.ipcRenderer.on('UDPRECEIVED', (event, arg) => {
        sub.next(arg);
        sub.complete();
      });
    }
    return sub as Observable<any>;
  }

  listenUDP() {
    const sub = new Subject();
    if(this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.on('UDPRECEIVED', (event, arg) => {
        sub.next(arg);
      });
    }
    return sub as Observable<any>;
  }

  connectTCP(ip: string, port: number) {
    if(this._electronService.isElectronApp) {
      console.log('isElectronApp');
      const result = this._electronService.ipcRenderer.sendSync('TCP', {address: ip, port: port});
      console.log('result', result);
    }
  }

  sendTcpCommand(cmd: string) {
    if(this._electronService.isElectronApp) {
      console.log('isElectronApp');
      const result = this._electronService.ipcRenderer.sendSync('TCPSEND', cmd);
      console.log('result', result);
    }
  }

  listen(): Observable<any> {
    const sub = new Subject();
    if(this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.on('TCPRECEIVED', (event, arg) => {
        sub.next(arg);
      });
    }
    return sub as Observable<any>;
  }
}
