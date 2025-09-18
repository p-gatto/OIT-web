import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ItemCard } from './item-card.model';
import { CardType } from './card-type.model';

@Component({
  selector: 'app-item-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './item-card.component.html',
  styleUrl: './item-card.component.css'
})
export class ItemCardComponent {

  @Input() item!: ItemCard;
  @Input() cardType!: CardType;
  @Input() isRecent = false;
  @Input() showRanking = false;
  @Input() ranking?: number;
  @Input() showFavoriteAnimation = false;

  @Output() itemView = new EventEmitter<ItemCard>();  // Solo visualizzazione
  @Output() itemUse = new EventEmitter<ItemCard>();   // Uso effettivo

  @Output() itemClick = new EventEmitter<ItemCard>();
  @Output() copyClick = new EventEmitter<string>();
  @Output() actionClick = new EventEmitter<ItemCard>();

  onItemView(): void {
    this.itemView.emit(this.item);
  }

  onItemUse(): void {
    this.itemUse.emit(this.item);
  }

  getDisplayTitle(): string {
    switch (this.cardType) {
      case 'weblink':
        return this.item.title || this.item.name;
      default:
        return this.item.name;
    }
  }

  getSubtitle(): string {
    if (this.item.category && this.item.subCategory) {
      return `${this.item.category} • ${this.item.subCategory}`;
    }
    if (this.cardType === 'credential' && this.item.username) {
      return this.item.username;
    }
    return this.item.category || this.item.area || '';
  }

  getMainCategory(): string {
    return this.item.area || this.item.category || 'Generale';
  }

  canCopy(): boolean {
    return (this.cardType === 'note' && !!this.item.freeText) ||
      this.cardType === 'credential';
  }

  getActionIcon(): string {
    switch (this.cardType) {
      case 'weblink':
        return 'open_in_new';
      case 'credential':
        return 'visibility';
      case 'note':
        return 'visibility';
      default:
        return 'visibility';
    }
  }

  getActionTooltip(): string {
    switch (this.cardType) {
      case 'weblink':
        return 'Apri link';
      case 'credential':
        return 'Visualizza credenziale';
      case 'note':
        return 'Visualizza nota';
      default:
        return 'Visualizza';
    }
  }

  onItemClick(): void {
    this.itemClick.emit(this.item);
  }

  onCopyClick(event: Event): void {
    event.stopPropagation();
    let textToCopy = '';

    if (this.cardType === 'note' && this.item.freeText) {
      textToCopy = this.item.freeText;
    } else if (this.cardType === 'credential') {
      // PROBLEMA: Il modello ItemCard non ha il campo password!
      // Dobbiamo modificare l'ItemCard model per includere la password
      if (this.item.username) {
        // Per ora, usiamo un campo password se disponibile nell'ItemCard
        const password = (this.item as any).password || 'Password non disponibile';
        textToCopy = `Username: ${this.item.username}\nPassword: ${password}`;
      } else {
        textToCopy = this.item.description || this.item.name;
      }
    }

    this.copyClick.emit(textToCopy);
  }

  onActionClick(event: Event): void {
    event.stopPropagation();
    this.actionClick.emit(this.item);
  }

  formatDate(dateString?: Date): string {
    if (!dateString) return 'Mai utilizzato';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Oggi';
    if (diffDays === 2) return 'Ieri';
    if (diffDays <= 7) return `${diffDays} giorni fa`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} settimane fa`;

    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

}