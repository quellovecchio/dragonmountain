import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Constants {
  static DEBUG_SKIP_INTRO = false;
  static DEBUG_ROOM = true;
  static TURN_LOGGING = false;
  static DAMAGE_LOGGING = true;
  //static TEXT_SPEED = 10;
  static TEXT_SPEED = 3;
  static FIGHT_CLOCK_SPEED = 85;
  static MUSIC_VOLUME = 0.5;
  static SOUND_VOLUME = 1;
  // max number of actors or locations to display
  static MAX_STAGE_ELEMENTS = 3;
  static TECH_DEMO_INTRO: string = "Welcome to Dragon Mountain Private Tech Demo!\n\nDragon Mountain is an upcoming text-based rpg rocking a powerful data customizing tool and an intriguing roguelike styled gameplay.\n\nYou can try a little demo to value its fast game loop.\n\nIf you need any hints..."
  static TECH_DEMO_HINT: string = "- you can Explore the Stage clicking one of three random extracted locations. You can refresh the Locations clicking the map icon and paying 1 EXP.\n- while exploring a Location you can fight or interact with NPCS. If enemies are ready for an ambush, you have to defeat them first.\n- Fighting and completing Quests gives you Exp. Exp given is (1 * stage level)\n- You can spend 1 EXP to level up your party or (4 * stage level) EXP to unlock the Boss Location, where you will fight to the death. If you win, you get to the next Stage.";
}
