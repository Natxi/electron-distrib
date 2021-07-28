import { Injectable } from '@angular/core';
import {ElectronService} from "ngx-electron";
import {Observable, of} from "rxjs";

interface ITestDB {
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class MongodbService {

  constructor(
    private _electronService: ElectronService,
  ) { }

  addDB(): boolean {
    if(this._electronService.isElectronApp) {
      console.log('isElectronApp');
      const result = this._electronService.ipcRenderer.sendSync('addDB', {name: 'Hello'});
      console.log('result', result);
      return result;
    }
    return false;
  }

  retrieveFromDB(): Observable<ITestDB[]> {
    if(this._electronService.isElectronApp) {
      console.log('isElectronApp');
      const result = this._electronService.ipcRenderer.sendSync('retrieveDB', 'hey');
      console.log('result', result);
      return of(result);
    }
    return of([]);
  }
}
