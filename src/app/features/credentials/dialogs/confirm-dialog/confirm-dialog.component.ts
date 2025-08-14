import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface DialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'create' | 'update' | 'delete' | 'duplicate' | 'activate' | 'deactivate' | 'default';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    // Imposta valori di default se non forniti
    this.data.confirmText = this.data.confirmText || this.getDefaultConfirmText();
    this.data.cancelText = this.data.cancelText || 'Annulla';
    this.data.type = this.data.type || 'default';
  }

  /**
   * Restituisce il testo di default per il bottone di conferma in base al tipo
   */
  private getDefaultConfirmText(): string {
    switch (this.data.type) {
      case 'create': return 'Crea';
      case 'update': return 'Modifica';
      case 'delete': return 'Elimina';
      case 'duplicate': return 'Duplica';
      case 'activate': return 'Attiva';
      case 'deactivate': return 'Disattiva';
      default: return 'Conferma';
    }
  }

  /**
   * Restituisce l'icona appropriata in base al tipo
   */
  getIcon(): string {
    switch (this.data.type) {
      case 'create': return 'add_circle';
      case 'update': return 'edit';
      case 'delete': return 'delete_forever';
      case 'duplicate': return 'content_copy';
      case 'activate': return 'check_circle';
      case 'deactivate': return 'cancel';
      default: return 'help';
    }
  }

  /**
   * Restituisce la classe CSS per il colore dell'icona
   */
  getIconClass(): string {
    switch (this.data.type) {
      case 'create': return 'text-green-600';
      case 'update': return 'text-blue-600';
      case 'delete': return 'text-red-600';
      case 'duplicate': return 'text-purple-600';
      case 'activate': return 'text-green-600';
      case 'deactivate': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  }

  /**
   * Restituisce la classe CSS per il bottone di conferma
   */
  getConfirmButtonClass(): string {
    switch (this.data.type) {
      case 'delete': return 'warn';
      case 'deactivate': return 'warn';
      default: return 'primary';
    }
  }

  /**
   * Gestisce la conferma
   */
  onConfirm(): void {
    this.dialogRef.close(true);
  }

  /**
   * Gestisce l'annullamento
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }
}