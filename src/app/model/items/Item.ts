import { ItemEffect } from "./ItemEffect";

var idCounter = 0;

export enum Rarity {
    common    = 0,
    uncommon  = 1,
    rare      = 2,
    epic      = 3,
    legendary = 4,
}

export class Item {

    id: number = 0;
    name: string;
    // what happens when used on NPC
    effect?: ItemEffect;
    thumbnailPath: string;
    moneyValue: number;
    rarity: Rarity = Rarity.common;

    constructor() {
            this.id = idCounter++;
            this.name = "item";
            this.thumbnailPath = "assets/images/items/item2.png";
            this.moneyValue = 0;
        }
}