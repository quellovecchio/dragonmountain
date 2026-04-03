import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Actor } from 'src/app/model/Actors/Actor';
import { Character } from 'src/app/model/Actors/Character';
import { PlayingCharacter } from 'src/app/model/Actors/PlayingCharacter';
import { Item } from 'src/app/model/items/Item';
import { ItemService } from 'src/app/services/item.service';
import { RunService } from 'src/app/services/run.service';
import { UiService } from '../ui.service';

@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.component.html',
  styleUrls: ['./action-bar.component.scss']
})
export class ActionBarComponent implements OnInit {
  @Output() interactOnPartyActorSignal = new EventEmitter<{ action: Item, actor: Actor }>();

  constructor(public itemService: ItemService, private uiService: UiService, public runService: RunService) { }

  ngOnInit(): void {
  }

  partyMemberClicked(actor: Actor) {
    if (this.uiService.getSelectedSkill()) {
      const caster = this.uiService.getSelectedSkillCaster();
      const skill = this.uiService.getSelectedSkill();
      if (caster && skill) {
        this.runService.castSkillOnActor(caster, skill, actor as Character);
        this.uiService.setSelectedSkill(undefined);
        this.uiService.setSelectedSkillCaster(undefined);
      }
    } else if (this.uiService.getSelectedItem()) {
      this.Interact(actor);
    } else {
      this.uiService.toggleActorInfo(actor as PlayingCharacter);
    }
  }

  Interact(actor: Actor) {
    this.runService.interact({ action: this.uiService.getSelectedItem()!, character: (actor as Character) });
    this.uiService.setSelectedItem(undefined);
  }

}
