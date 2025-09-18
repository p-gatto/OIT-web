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

  @Output() itemView = new EventEmitter<ItemCard>(); // Per sola visualizzazione
  @Output() itemUse = new EventEmitter<ItemCard>();  // Per uso effettivo con incremento

  @Output() navigate = new EventEmitter<void>();
  @Output() itemClick = new EventEmitter<ItemCard>();
  @Output() copyClick = new EventEmitter<string>();
  @Output() actionClick = new EventEmitter<ItemCard>();

  onItemView(item: ItemCard): void {
    this.itemView.emit(item);
  }

  onItemUse(item: ItemCard): void {
    this.itemUse.emit(item);
  }

  onNavigate(): void {
    this.navigate.emit();
  }

  onItemClick(item: ItemCard): void {
    this.itemClick.emit(item);
  }

  onCopyClick(text: string): void {
    this.copyClick.emit(text);
  }

  onActionClick(item: ItemCard): void {
    this.actionClick.emit(item);
  }

  trackByItem(index: number, item: ItemCard): number {
    return item.id;
  }

}
