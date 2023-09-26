import { Buff } from "../Buff";
import { Item } from "./Item";

export class Equip extends Item {

    attack: number;
    defense: number;
    buffs: Buff[] = [];

    constructor() {
            super();
            this.attack = 0;
            this.defense = 0;
            this.buffs = [];
        }
}