import { Component, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Location } from "../model/Location";

@Component({
  selector: 'app-location-preview',
  templateUrl: './location-preview.component.html',
  styleUrls: ['./location-preview.component.scss']
})
export class LocationPreviewComponent implements OnInit {

  @Input() locationData!: Location;
  @Output() exploreSignal = new EventEmitter<string>();

  xMenuPosition: number = 0;
  yMenuPosition: number = 0;

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
  }

  explore() {
    this.exploreSignal.emit("The party moved to " + this.locationData.name + ".");
  }

}
