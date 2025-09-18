import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { ItemCardComponent } from '../item-card/item-card.component';
import { ItemSection } from './item-section.model';
import { ItemCard } from '../item-card/item-card.model';

@Component({
  selector: 'app-item-section',
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    ItemCardComponent
  ],
  templateUrl: './item-section.component.html',
  styleUrl: './item-section.component.css'
})
export class ItemSectionComponent {

  @Input() config!: ItemSection;
  @Input() mostUsedItems: ItemCard[] = [];
  @Input() recentItems: ItemCard[] = [];

  @Output() navigate = new EventEmitter<void>();
  @Output() itemClick = new EventEmitter<ItemCard>();
  @Output() copyClick = new EventEmitter<{ text: string, item: ItemCard }>();
  @Output() actionClick = new EventEmitter<ItemCard>();

  onNavigate(): void {
    this.navigate.emit();
  }

  onItemClick(item: ItemCard): void {
    this.itemClick.emit(item);
  }

  onCopyClick(text: string, item?: ItemCard): void {
    if (item) {
      this.copyClick.emit({ text, item });
    }
  }

  onActionClick(item: ItemCard): void {
    this.actionClick.emit(item);
  }

  trackByItem(index: number, item: ItemCard): number {
    return item.id;
  }

}
