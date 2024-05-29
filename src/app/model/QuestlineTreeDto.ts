export class TreeNodeDto {
    location: number;
    children: number[];

    constructor(value: number) {
        this.location = value;
        this.children = [];
    }

    addChild(child: number): void {
        this.children.push(child);
    }
}

export class QuestlineTreeDto {
    root: TreeNodeDto;

    constructor(rootValue: number) {
        this.root = new TreeNodeDto(rootValue);
    }
}