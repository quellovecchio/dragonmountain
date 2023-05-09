import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Character } from '../model/Actors/Character';
import { Location } from '../model/Location';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit {

  @Input() locationData?: Location;
  @Output() interactSignal = new EventEmitter<Character>();
  @Output() backSignal = new EventEmitter<Location>();

  constructor() { }

  ngOnInit(): void {
  }

  interact(character: Character) {
    this.interactSignal.emit(character);
  }

  goBackToScene() {
    this.backSignal.emit(this.locationData);
  }

  // duped code, TODO implement interface with method
  getActorWidth(): number {
    if (this.locationData?.actors?.length == 3) {
       return 33;
    } else if (this.locationData?.actors?.length == 2) {
      return 50;
    } else {
      return 100;
    }
  }

}
