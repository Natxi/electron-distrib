import { Component, OnInit } from '@angular/core';
import {UpdService} from "./upd.service";
import { ElectronService } from 'ngx-electron'
import { Observable } from 'out/nach-electron-linux-x64/resources/app/node_modules/rxjs';
import {Socket} from "net";
import {MongodbService} from "./mongodb.service";
import {JsondbService} from "./jsondb.service";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {VideoConferenceService} from "./video-conference.service";
import {timeout} from "rxjs/operators";
import {timer} from "rxjs";

export interface TestDB  {
  name: string;
}

export interface Config  {
  name: string;
  ip: string;
  port: number;
}

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css'],
})
export class SceneComponent implements OnInit {

  // private tcpSocket: Socket;
  private connected = false;
  private config: Config[] = [];
  tcpFormGroup: FormGroup = new FormGroup({});
  udpFormGroup: FormGroup = new FormGroup({});
  ipFormGroup: FormGroup = new FormGroup({});
  constructor(
    private _udp: UpdService,
    private _db: MongodbService,
    private _jsondb: JsondbService,
    private _formBuilder: FormBuilder,
    private videoConferenceService: VideoConferenceService
  ) { }

  ngOnInit(): void {
    this.tcpFormGroup = this._formBuilder.group({
      cmd: [''],
    });
    this.udpFormGroup = this._formBuilder.group({
      cmd: [''],
    });
    this.ipFormGroup = this._formBuilder.group({
      cmd: [''],
    });
    this._jsondb.getData().subscribe((result) => {
      console.log('jsondb data', result);
      this.config = result;
      const multiViewerConfig = this.config.find(config => config.name === 'multiviewer');
      if (multiViewerConfig) {
        this._udp.connectUDP(multiViewerConfig.ip, multiViewerConfig.port);
      }
    });

    this._udp.connectTCP('192.168.9.53', 5678);
    this._udp.listen().subscribe((next) =>  {
      console.log('next TCP', next);
    })
    this._udp.listenUDP().subscribe((next) =>  {
      console.log('next UDP', next);
    });

    // if (this.tcpSocket) {
    //   this.tcpSocket.on('data', (data) => {
    //     console.log('Received: ' + data);
    //
    //     // this.client.destroy(); // kill client after server's response
    //   });
    // }

  }


  getScene() {
    return [{name: 'Sala estándar'}, {name: 'Pruebas desde cámara 1'}]
  }

  test() {
    console.log('This has been pressed!');
  }

  sendUDP() {
    const multiViewerConfig = this.config.find(config => config.name === 'mixer');
    if (multiViewerConfig) {
      this._udp.sendUdpObservable(multiViewerConfig.ip, multiViewerConfig.port, this.udpFormGroup.controls['cmd'].value)
        .subscribe((next => {
          console.log('response UDP', next);
        }));
    } else{
      console.log('no multiviewe conf found!');
    }

  }

  sendTCP() {
    this._udp.sendTcpCommand(this.tcpFormGroup.controls.cmd.value);
  }

  addNewConfig() {
    if (this._db.addDB()) {
     console.log('successfully added!')
    }
  }

  retrieve() {
    this._db.retrieveFromDB().subscribe((greets) => {
      greets.forEach(greet => {
        console.log('greet', greet);
      });
    });
  }

  getJSONData() {
    this._jsondb.getData().subscribe((result) => {
      console.log('jsondb data', result);
    })

  }

  setScene1() {
    //mixer ip
    // {name: 'mixer', ip: '192.168.9.51', port: 0},
    // //matrix ip
    // {name: 'matrix', ip: '192.168.9.52', port: 7000},
    // // vcf ip
    // {name: 'vcf', ip: '192.168.9.53', port: 0},
    // // multiviewer ip
    // {name: 'multiviewer', ip: '192.168.9.54', port: 7000},
    // //cam1 ip
    // {name: 'cam1', ip: '192.168.9.55', port: 1259},
    // //cam2 ip
    // {name: 'cam2', ip: '192.168.9.56', port: 1259}

    this._udp.sendUdpCommand('192.168.9.54', 7000, 'A56C1500A3FF0100000000000000000094046103AE');

  }

  call() {
    console.log('Calling to ' + this.ipFormGroup.controls['cmd'].value);
    const commands = this.videoConferenceService.getVideoConferenceCommandsFromDest(this.ipFormGroup.controls['cmd'].value);
    console.log(commands);
    let time = 1000;
    commands.forEach(command => {
      setTimeout(() => {
          this._udp.sendTcpCommand(command);
      }, time);
      time += 500;
    })
  }
}
