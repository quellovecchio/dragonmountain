import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Constants {
  //static TEXT_SPEED = 1;
  static TEXT_SPEED = 100;
  // max number of actors or locations to display
  static MAX_STAGE_ELEMENTS = 3;
}