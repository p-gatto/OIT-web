import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NotesService } from './notes.service';
import { Note } from './note.models';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-notes',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.css'
})
export default class NotesComponent {

  notesService = inject(NotesService);
  route = inject(ActivatedRoute);

  loading = true;
  selectedTabIndex = 0;

  allNotes: Note[] = [];
  noteTypes: string[] = [];

  constructor() { }

  ngOnInit(): void {
    // Check for query params to set initial tab
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        // Handle tab selection if needed
      }
    });

    this.loadData();
  }

  loadData(): void {
    // Load all notes and extract unique types
    this.notesService.getAll().subscribe({
      next: (notes) => {
        this.allNotes = notes;
        this.noteTypes = [...new Set(notes.map(note => note.type))].sort();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notes data:', error);
        this.loading = false;
      }
    });
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
  }

  // Metodi per contare le note per tipo
  getNoteCountByType(type: string): number {
    return this.allNotes.filter(note => note.type === type).length;
  }

  // Metodi per filtrare le note per tipo e categoria
  getMostUsedByType(type: string, count: number = 10): Note[] {
    return this.allNotes
      .filter(note => note.type === type)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, count);
  }

  getFavoritesByType(type: string, count: number = 10): Note[] {
    return this.allNotes
      .filter(note => note.type === type && note.isFavorite)
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
      .slice(0, count);
  }

  getRecentByType(type: string, count: number = 10): Note[] {
    return this.allNotes
      .filter(note => note.type === type)
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
      .slice(0, count);
  }

  openNote(note: Note, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    // Increment usage count
    this.notesService.incrementUsage(note.id).subscribe({
      next: () => {
        // Refresh data to show updated usage count
        this.loadData();
      },
      error: (error) => {
        console.error('Error incrementing usage:', error);
      }
    });

    // Here you could open a detailed view or copy to clipboard
    // For now, we'll show the content in an alert (you can improve this)
    const content = note.freeText ? `${note.description}\n\n${note.freeText}` : note.description;
    if (content) {
      // You could open a detailed dialog here instead
      console.log('Note content:', content);
    }
  }

  copyToClipboard(text: string, event: Event): void {
    event.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      // Show success message
      console.log('Copiato negli appunti');
    });
  }

  getTypeIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'Comando': 'terminal',
      'Procedura': 'list_alt',
      'Informazione Generica': 'info',
      'Nota Tecnica': 'engineering',
      'Tutorial': 'school',
      'Snippet di Codice': 'code',
      'Configurazione': 'settings',
      'Risoluzione Problema': 'build_circle'
    };
    return iconMap[type] || 'note';
  }

  getTypeColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      'Comando': 'bg-green-100 text-green-800',
      'Procedura': 'bg-blue-100 text-blue-800',
      'Informazione Generica': 'bg-gray-100 text-gray-800',
      'Nota Tecnica': 'bg-purple-100 text-purple-800',
      'Tutorial': 'bg-orange-100 text-orange-800',
      'Snippet di Codice': 'bg-indigo-100 text-indigo-800',
      'Configurazione': 'bg-yellow-100 text-yellow-800',
      'Risoluzione Problema': 'bg-red-100 text-red-800'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  }

  trackByNote(index: number, note: Note): number {
    return note.id;
  }

  trackByType(index: number, type: string): string {
    return type;
  }

  formatDate(dateString: Date): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Oggi';
    if (diffDays === 2) return 'Ieri';
    if (diffDays <= 7) return `${diffDays} giorni fa`;

    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

}