import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { Location } from "../model/Location";

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit {

  @Input() locationData!: Location;
  @Output() exploreSignal = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  explore() {
    this.exploreSignal.emit("The party moved to " + this.locationData.name + ".");
  }

}
