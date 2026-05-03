import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Item, Rarity } from 'src/app/model/items/Item';
import { Equip } from 'src/app/model/items/Equip';

export type ItemType = 'consumable' | 'weapon' | 'key' | 'relic';

@Component({
  selector: 'app-items-table',
  templateUrl: './items-table.component.html',
  styleUrls: ['./items-table.component.scss']
})
export class ItemsTableComponent implements OnInit {

  // Expose enum so the template can reference Rarity.common etc.
  readonly Rarity = Rarity;

  @Input() dataSource: MatTableDataSource<Item> = new MatTableDataSource();
  @Input() compact: boolean = false;
  @Input() inventory: boolean = false;
  @Input() playerGold: number = 0;

  @Output() clickEvent = new EventEmitter<Item>();
  @Output() buyEvent = new EventEmitter<Item>();

  boughtIds = new Set<number>();

  hoveredItem: Item | null = null;
  tooltipStyle: { [key: string]: string } = {};
  private tooltipTimer: any;

  constructor() {}

  ngOnInit(): void {}

  // ── Row actions ───────────────────────────────────────────────

  onActionClick(item: Item, event: MouseEvent): void {
    event.stopPropagation();
    this.clickEvent.emit(item);
  }

  onBuy(item: Item, event: MouseEvent): void {
    event.stopPropagation();
    if (!this.isBought(item) && this.canAfford(item)) {
      this.boughtIds.add(item.id);
      this.buyEvent.emit(item);
    }
  }

  isBought(item: Item): boolean {
    return this.boughtIds.has(item.id);
  }

  canAfford(item: Item): boolean {
    return this.playerGold >= item.moneyValue;
  }

  // ── Item classification ───────────────────────────────────────

  asEquip(item: Item): Equip {
    return item as Equip;
  }

  isEquipItem(item: Item): boolean {
    const e = item as Equip;
    return (e.attack !== undefined && e.attack > 0)
        || (e.defense !== undefined && e.defense > 0)
        || (e.buffs !== undefined && e.buffs.length > 0);
  }

  getItemType(item: Item): ItemType {
    const e = item as Equip;
    if ((e.attack !== undefined && e.attack > 0) || (e.defense !== undefined && e.defense > 0)) {
      return 'weapon';
    }
    if (item.effect) {
      return 'consumable';
    }
    if (item.name.toLowerCase().includes('key')) {
      return 'key';
    }
    return 'relic';
  }

  getTypeIcon(type: ItemType): string {
    const icons: Record<ItemType, string> = {
      consumable: '⚗',
      weapon:     '⚔',
      key:        '🗝',
      relic:      '💀',
    };
    return icons[type];
  }

  // ── Rarity helpers ────────────────────────────────────────────

  /** Returns the lowercase name string for a numeric Rarity value. */
  getRarityName(rarity: Rarity): string {
    return Rarity[rarity]; // e.g. 2 → 'rare'
  }

  /** Returns the hex colour associated with a rarity tier. */
  getRarityColor(rarity: Rarity): string {
    const colors: Record<number, string> = {
      [Rarity.common]:    '#9a9a9a',
      [Rarity.uncommon]:  '#22c55e',
      [Rarity.rare]:      '#4c7b94',
      [Rarity.epic]:      '#9b59b6',
      [Rarity.legendary]: '#F1C66A',
    };
    return colors[rarity] ?? '#9a9a9a';
  }

  // ── Tooltip ──────────────────────────────────────────────────

  onRowMouseEnter(item: Item, rowEl: HTMLElement): void {
    clearTimeout(this.tooltipTimer);
    this.tooltipTimer = setTimeout(() => {
      const rect = rowEl.getBoundingClientRect();
      const tooltipWidth = 280;
      const rightPos = rect.right + 16;
      const flipLeft = rightPos + tooltipWidth > window.innerWidth;
      this.tooltipStyle = {
        top:  rect.top + 'px',
        left: flipLeft ? (rect.left - tooltipWidth - 16) + 'px' : rightPos + 'px',
      };
      this.hoveredItem = item;
    }, 180);
  }

  onRowMouseLeave(): void {
    clearTimeout(this.tooltipTimer);
    this.hoveredItem = null;
  }
}
