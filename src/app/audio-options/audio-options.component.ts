import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-audio-options',
  templateUrl: './audio-options.component.html',
  styleUrls: ['./audio-options.component.css']
})
export class AudioOptionsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  onAudioOptionSelected() {
    console.log('audio option selected!');
  }
}
