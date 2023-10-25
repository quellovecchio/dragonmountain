import { ItemEffect } from "./ItemEffect";

export class Item {

    name: string;
    // what happens when used on NPC
    effect?: ItemEffect;
    thumbnailPath: string;
    moneyValue: number;

    constructor() {
            this.name = "test_item";
            this.thumbnailPath = "assets/images/item1.png";
            this.moneyValue = 0;
        }
}