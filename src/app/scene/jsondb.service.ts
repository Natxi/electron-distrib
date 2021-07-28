import { Injectable } from '@angular/core';
import { JsonDB } from 'node-json-db';
import {of} from "rxjs";
import {ElectronService} from "ngx-electron";

@Injectable({
  providedIn: 'root'
})
export class JsondbService {

  constructor(
    private _electronService: ElectronService,
  ) {}

  getData() {
    if(this._electronService.isElectronApp) {
      console.log('isElectronApp');
      const result = this._electronService.ipcRenderer.sendSync('jsonRetrieveDB', 'hey');
      console.log('result', result);
      return of(result);
    }
    return of(null);
  }

}
