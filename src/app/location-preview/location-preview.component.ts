import { Component, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Location } from "../model/Location";
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-location-preview',
  templateUrl: './location-preview.component.html',
  styleUrls: ['./location-preview.component.scss'],
  animations: [
    trigger(
      'reloadLocations', 
      [
        transition(
          ':enter', 
          [
            animate('2s ease', 
            style({ transform:  'rotateY(1800deg)' }))
          ]
        )
      ]
    )
  ]
})
export class LocationPreviewComponent implements OnInit {

  @Input() locationData!: Location;
  @Output() exploreSignal = new EventEmitter<string>();

  xMenuPosition: number = 0;
  yMenuPosition: number = 0;

  animateLocation: boolean = false;

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
  }

  explore() {
    this.exploreSignal.emit("The party moved to " + this.locationData.name + ".");
  }

  reloadLocations(){
    // animation
    this.animateLocation = true;
    setTimeout(() => {this.animateLocation = false;}, 400);
    // TODO real logic
  }

}
