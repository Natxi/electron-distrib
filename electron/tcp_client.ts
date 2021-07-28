import * as net from 'net';
import * as Electron from 'electron';
import {Observable, Subject} from "rxjs";
import {BrowserWindow} from "electron";
import * as mongoose from "mongoose";
import {Buffer} from "buffer";

export interface IpPort {
  address: string,
  port: number
}
export class TCPClient {
  private client;
  private sub = new Subject();

  constructor() {
  }

  start(mainWindow: BrowserWindow) {
    console.log('starting TCPClient');
    Electron.ipcMain.on('TCP', (event, arg) => {
      const ipPort = arg as IpPort;
      console.log(ipPort);
      this.client = new net.Socket();
      this.client.connect(ipPort.port, ipPort.address, () => {
        console.log('Connected');
        event.returnValue = 'yeees';
      });

      this.client.on('data', (data) => {
        console.log('Received: ' + data);
        mainWindow.webContents.send('TCPRECEIVED', data.toString());
        // this.client.destroy(); // kill client after server's response
      });

      this.client.on('close', () => {
        console.log('Connection closed');
      });

      this.client.on('error', (err) => {
        console.log(`Connection error: ${JSON.stringify(err)}`);
        throw err;
      });
      // event.returnValue = 'yeees';
    });

    Electron.ipcMain.on('TCPSEND', (event, arg) => {

      // const hex_string = 'A10602E619B748FF';
      const bytes = this.hexStringToByteArray(arg);
      const message = Buffer.from(bytes);
      // this.client.write('Hello, server! Love, Client.');
      this.client.write(message);
      event.returnValue = '';
    });
  }

  hexStringToByteArray(hexString) {
    if (hexString.length % 2 !== 0) {
      throw "Must have an even number of hex digits to convert to bytes";
    }/* w w w.  jav  a2 s .  c o  m*/
    const numBytes = hexString.length / 2;
    const byteArray = new Uint8Array(numBytes);
    for (let i=0; i<numBytes; i++) {
      byteArray[i] = parseInt(hexString.substr(i*2, 2), 16);
    }
    return byteArray;
  }
}



export interface DBTest {
  name: string;
}

export function startDB() {
  mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error: '));
  db.once('open', () => {
    console.log('connected!');
    const DBTestSchema = new mongoose.Schema({
      name: String
    });
    const Test = mongoose.model('Test', DBTestSchema);
    Electron.ipcMain.on('addDB', (event, arg) => {
      const greet = new Test(arg);
      greet.save((err, saved) => {
        if (err) {
          console.log(`error saving into db ${JSON.stringify(err)}`);
          event.returnValue = false;
        } else {
          console.log('saving into db successfully!');
          event.returnValue = true;
        }
      })
    });

    Electron.ipcMain.on('retrieveDB', (event, arg) => {
      Test.find((err, greets) => {
        if (err) {
          console.log(`error retrieving from db ${JSON.stringify(err)}`);
          event.returnValue = false;
        } else {
          console.log(greets);
          event.returnValue = greets;
        }
      })
    });

  });

}
