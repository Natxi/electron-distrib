import * as Electron from 'electron';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig'


export function start() {
  const db = new JsonDB(new Config('myTestDB', true, true, '/'));

  const config = [
    //mixer ip
    {name: 'mixer', ip: '192.168.9.51', port: 10023},
    //matrix ip
    {name: 'matrix', ip: '192.168.9.52', port: 7000},
    // vcf ip
    {name: 'vcf', ip: '192.168.9.53', port: 0},
    // multiviewer ip
    {name: 'multiviewer', ip: '192.168.9.54', port: 7000},
    //cam1 ip
    {name: 'cam1', ip: '192.168.9.55', port: 1259},
    //cam2 ip
    {name: 'cam2', ip: '192.168.9.56', port: 1259}
  ]

  db.push('/config', config);

  Electron.ipcMain.on('jsonRetrieveDB', (event, arg) => {
    const result = db.getData('/config');
    console.log('result', result);
    event.returnValue = result;
  });

}

