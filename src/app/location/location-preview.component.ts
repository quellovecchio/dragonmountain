import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Location } from "../model/Location";

@Component({
  selector: 'app-location-preview',
  templateUrl: './location-preview.component.html',
  styleUrls: ['./location-preview.component.scss']
})
export class LocationPreviewComponent implements OnInit {

  @Input() locationData!: Location;
  @Output() exploreSignal = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  explore() {
    this.exploreSignal.emit("The party moved to " + this.locationData.name + ".");
  }

}
