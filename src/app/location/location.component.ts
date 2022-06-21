import { Component, Input, OnInit } from '@angular/core';
import { Location } from "../model/Location";

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit {

  @Input() locationData!: Location;

  constructor() { }

  ngOnInit(): void {
  }

}
