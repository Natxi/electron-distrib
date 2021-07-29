import * as dgram from 'dgram';
import * as Electron from 'electron';
import {BrowserWindow} from "electron";
import { Buffer } from 'buffer';
import {Observable, Subject, timer} from "rxjs";

export interface IpPort {
  address: string,
  port: number
}

export class UDPClient {
  private client;

  constructor() {
  }

  start(mainWindow: BrowserWindow) {

    console.log('starting UDP server');
    const server = dgram.createSocket('udp4');
    server.on('error',(error) => {
      console.log('Error: ' + error);
      server.close();
    });

    server.on('message',function(msg,info) {
      console.log('Data received from client : ' + msg.toString());
      console.log(`msg received from ${info.address}:${info.port} received bytes: ${msg.length}`);
    });

    server.on('listening',function(){
      const address = server.address();
      const port = address.port;
      const family = address.family;
      const ipaddr = address.address;
      console.log('Server is listening at port' + port);
      console.log('Server ip :' + ipaddr);
      console.log('Server is IP4/IP6 : ' + family);
    });

    server.on('close',function(){
      console.log('Socket is closed !');
    });

    server.bind(2222);

    Electron.ipcMain.on('UDP', (event, arg) => {
      const ipPort = arg as IpPort;
      console.log(ipPort);
      this.client = dgram.createSocket('udp4');
      this.client.on('message', (msg, rinfo) => {
        const hex = Buffer.from(msg).toString('hex');
        const packet_header = hex.substring(0, 4);
        const data_length = hex.substring(4, 8);
        const device_type = hex.substring(8, 10);
        const device_id = hex.substring(10, 12);
        const interface_type = hex.substring(12, 14);
        const reserve = hex.substring(14, 28);
        const command = hex.substring(28, 30);
        const response_status = hex.substring(30, 32);
        const response_content = hex.substring(32, hex.length -6);
        const checksum = hex.substring(hex.length -6, hex.length -2);
        const packet_end = hex.substring(hex.length -2, hex.length);
        // console.log(packet_header);
        // console.log(data_length);
        // console.log(device_type);
        // console.log(device_id);
        // console.log(interface_type);
        // console.log(reserve);
        // console.log(command);
        // console.log(response_status);
        // console.log(response_content);
        // console.log(checksum);
        // console.log(packet_end);
        console.log('Data received from client : ' + hex);
        console.log(`msg received from ${rinfo.address}:${rinfo.port} bytes: ${msg.length}`);
        mainWindow.webContents.send('UDPRECEIVED', hex);
      });

      event.returnValue = 'yeees';
    });

    function getUdpData() {

    }
    Electron.ipcMain.on('UDPTEST', (event, arg) => {
      // const ipPort = arg as {address: string,
      //   port: number, cmd: string};
      // const hex_string = ipPort.cmd;
      // const bytes = this.hexStringToByteArray(hex_string);
      // const message = Buffer.from(bytes);


      const sub = new Subject();
      timer(2000).subscribe(
        next => console.log('next subject after 2 secs'),
        error => console.log('error on UDPTEST', error),
        () => {
          sub.next('wtf');
          sub.complete();
          // event.returnValue = 'end after two seconds';
        });
      event.reply('getUdpData')
      event.returnValue = sub as Observable<any>;
    });

    Electron.ipcMain.on('UDPSEND', (event, arg) => {
      const ipPort = arg as {address: string,
        port: number, cmd: string};
      console.log('port => ', ipPort.port);
      console.log('ip => ', ipPort.address);

      //a56c1500a3ff0100000000000000000094005d03ae
      // const hex_string = 'A56C1500A3FF0100000000000000000094046103AE';
      const hex_string = ipPort.cmd;

      const bytes = this.hexStringToByteArray(hex_string);
      // const testSendUDP = '0x8101043f0201ff';
      const message = Buffer.from(bytes);
      // const multiviewerip = 'a5 6c 15 00 a3 ff 01 00 00 00 00 00 00 00 00 00 94 04 61 03 ae'
      // const test = "\a5l\16\00\a3\ff\01\00\00\00\00\00\00\00\00\00\95\01\00`\03\ae";
      // const multiviewerip = '\\a5l\\16\\00\\a3\\ff\\01\\00\\00\\00\\00\\00\\00\\00\\00\\00\\95\\01\\00`\\03\\ae'
      // const message = Buffer.from('a56c1500a3ff0100000000000000000094096603ae');
      // const testClient = dgram.createSocket('udp4');
      this.client.send(message, 0, message.length,  ipPort.port, ipPort.address, (err, bytes) => {
        console.log('err', err);
        console.log('bytes', bytes);
      });
      event.returnValue = 'yeees';
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
