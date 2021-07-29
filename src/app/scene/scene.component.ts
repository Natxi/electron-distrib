import { Component, OnInit } from '@angular/core';
import {UpdService} from "./upd.service";
import { ElectronService } from 'ngx-electron'
import { Observable } from 'out/nach-electron-linux-x64/resources/app/node_modules/rxjs';
import {Socket} from "net";
import {MongodbService} from "./mongodb.service";
import {JsondbService} from "./jsondb.service";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";

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
  constructor(
    private _udp: UpdService,
    private _db: MongodbService,
    private _jsondb: JsondbService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.tcpFormGroup = this._formBuilder.group({
      cmd: [''],
    });
    this.udpFormGroup = this._formBuilder.group({
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
    // this._udp.listenUDP().subscribe((next) =>  {
    //   console.log('next UDP', next);
    // });

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
    const multiViewerConfig = this.config.find(config => config.name === 'multiviewer');
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

  setScene(scene: number) {

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

    const multiViewerConfig = this.config.find(config => config.name === 'multiviewer');
    const cam1Config = this.config.find(config => config.name === 'cam1');
    const cam2Config = this.config.find(config => config.name === 'cam2');
    const matrixConfig = this.config.find(config => config.name === 'matrix');

    if (multiViewerConfig && cam1Config && cam2Config && matrixConfig) {
      switch (scene) {
        case 1:
          this._udp.sendUdpObservable(multiViewerConfig.ip, multiViewerConfig.port, 'A56C1500A3FF0100000000000000000094096603AE').subscribe(
            next => {
              console.log('Activar Layout 9 Multiviewer ok');
              this._udp.sendUdpObservable(cam1Config.ip, cam1Config.port, '8101043F0201FF').subscribe(
                next => {
                  console.log('Enviar cámara 1 declarante a preset 1 ok');
                  this._udp.sendUdpObservable(cam1Config.ip, cam1Config.port, '8101043502FF').subscribe(
                    next => {
                      console.log('Poner foco automático cam 1 ok');
                      this._udp.sendUdpObservable(cam2Config.ip, cam2Config.port, '8101043F0201FF').subscribe(
                        next => {
                          console.log('Enviar cámara 2 juez a preset 1 ok');
                          this._udp.sendUdpObservable(cam2Config.ip, cam2Config.port, '8101043802FF').subscribe(
                            next => {
                              console.log('Poner foco automático cam 2 ok');
                              this._udp.sendUdpObservable(matrixConfig.ip, matrixConfig.port, 'All#').subscribe(
                                next => {
                                  console.log('Activar Escena Matriz (ALL#) ok', next);
                                },error => console.log('Activar Escena Matriz (ALL#) error', error));
                            },
                            error => console.log('Poner foco automático cam 2 error', error),
                            () => {
                              console.log('End of scene 1 configuration');
                              // this.openSnackBar('Scene 1 successfully configured', 'Close')
                            });
                        },
                        error => console.log('Enviar cámara 2 juez a preset 1 error', error));
                    },
                    error => console.log('Poner foco automático cam 1 error', error));
                },
                error => console.log('Enviar cámara 1 declarante a preset 1 error', error));
            },
            error => console.log('Activar Layout 9 Multiviewer error', error));

          // //Activar Layout 9 Multiviewer
          // this._udp.sendUdpObservable(multiViewerConfig.ip, multiViewerConfig.port, 'A56C1500A3FF0100000000000000000094096603AE')
          //   .subscribe(next => {
          //     console.log('Activar Layout 9 Multiviewer ok');
          //     this._udp.sendUdpObservable(cam1Config.ip, cam1Config.port, '8101043F0201FF').subscribe(next => {
          //       console.log('Enviar cámara 1 declarante a preset 1 ok');
          //       this._udp.sendUdpObservable(cam1Config.ip, cam1Config.port, '8101043502FF').subscribe(next => {
          //         console.log('Poner foco automático cam 1 ok');
          //         this._udp.sendUdpObservable(cam2Config.ip, cam2Config.port, '8101043F0201FF').subscribe(next => {
          //           console.log('Enviar cámara 2 juez a preset 1 ok');
          //           this._udp.sendUdpObservable(cam2Config.ip, cam2Config.port, '8101043802FF').subscribe(next => {
          //             console.log('Poner foco automático cam 2 ok');
          //             // this._udp.sendUdpObservable(multiViewerConfig.ip, multiViewerConfig.port, 'A56C1500A3FF0100000000000000000099004400450043004C004100520041004').subscribe(next => {
          //             //   console.log('Activar Nombre 1 "DECLARANTE" ok');
          //             //   this._udp.sendUdpObservable(multiViewerConfig.ip, multiViewerConfig.port, 'A56C1500A3FF0100000000000000000099014500530054005200410044004F008').subscribe(next => {
          //             //     console.log('Activar Nombre 2 "ESTRADO" ok');
          //             //   });
          //             // });
          //             //TODO test matrix
          //             // this._udp.sendUdpObservable(matrixConfig.ip, matrixConfig.port, 'All#').subscribe(next => {
          //             //   console.log('Activar Escena Matriz (ALL#) ok');
          //             // });
          //           });
          //         });
          //       });
          //     },error => console.log('error', error),
          //       () => {
          //         console.log('Scene 1 successfully configured');
          //     });
          //   },error =>  console.log('error', error),
          //     () => {
          //     console.log('Scene 1 successfully configured');
          //   });
          break;
        case 2:
          break;
        case 3:
          break;
        case 4:
          break;
        case 5:
          break;
        default:
          break;
      }
    }
  }

  setScene1() {
    this.setScene(1);
  }

  setScene2() {
    console.time('test');
    const t = this._udp.test();
    console.log('test', t);
    console.timeEnd('test');
  }

  setScene3() {
    this.setScene(3);
  }

  setScene4() {
    this.setScene(4);
  }

  setScene5() {
    this.setScene(5);
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action)
  }
}
