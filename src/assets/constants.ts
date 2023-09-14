import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Constants {
  //static TEXT_SPEED = 1;
  static TEXT_SPEED = 100;
  // max number of actors or locations to display
  static MAX_STAGE_ELEMENTS = 3;
  static TECH_DEMO_INTRO: string = "Welcome to Dragon Mountain Private Tech Demo!\n\nDragon Mountain is an upcoming text-based rpg rocking a powerful data customizing tool and an intriguing roguelike styled gameplay.\n\nYou can try a little demo to value its fast game loop.\n\nIf you need any hints..."
  static TECH_DEMO_HINT: string = "- you can Explore the Stage clicking one of three random extracted locations. You can refresh the Locations clicking the map icon and paying 1 EXP.\n- while exploring a Location you can fight or interact with NPCS. If enemies are ready for an ambush, you have to defeat them first.\n- Fighting and completing Quests gives you Exp. Exp given is (1 * stage level)\n- You can spend (4 * stage level) to unlock the Boss Location, where you will fight to the death. If you win, you get to the next Stage.";
}