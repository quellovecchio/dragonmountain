import { ItemEffect } from "./ItemEffect";

var idCounter = 0;

export class Item {

    id: number = 0;
    name: string;
    // what happens when used on NPC
    effect?: ItemEffect;
    thumbnailPath: string;
    moneyValue: number;

    constructor() {
            this.id = idCounter++;
            this.name = "item";
            this.thumbnailPath = "assets/images/items/item2.png";
            this.moneyValue = 0;
        }
}