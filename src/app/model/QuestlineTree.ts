import { Location } from './Location';

export class TreeNode {
    location: Location;
    children: TreeNode[];

    constructor(value: Location) {
        this.location = value;
        this.children = [];
    }

    addChild(child: TreeNode): void {
        this.children.push(child);
    }
}

export class QuestlineTree {
    root: TreeNode;

    constructor(rootValue: Location) {
        this.root = new TreeNode(rootValue);
    }
}