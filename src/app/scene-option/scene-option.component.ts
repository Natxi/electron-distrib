import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-scene-option',
  templateUrl: './scene-option.component.html',
  styleUrls: ['./scene-option.component.css']
})
export class SceneOptionComponent implements OnInit {

  @Input() description: string = '';
  @Input() icon: string = '';
  @Input() color: string = 'blue';
  private panelOpenState: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  isPanelOpen(): boolean {
    return this.panelOpenState;
  }

  setPanelState(state: boolean) {
    this.panelOpenState = state;
  }

}
