import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  mostUsedNotes: Note[] = [];
  favoriteNotes: Note[] = [];
  recentNotes: Note[] = [];

  constructor() { }

  ngOnInit(): void {
    // Check for query params to set initial tab
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        switch (params['tab']) {
          case 'most-used':
            this.selectedTabIndex = 0;
            break;
          case 'favorites':
            this.selectedTabIndex = 1;
            break;
          case 'recent':
            this.selectedTabIndex = 2;
            break;
        }
      }
    });

    this.loadData();
  }

  loadData(): void {
    // Load all data in parallel
    Promise.all([
      this.notesService.getMostUsed(10).toPromise(),
      this.notesService.getFavorites(10).toPromise(),
      this.notesService.getRecent(10).toPromise()
    ]).then(([mostUsed, favorites, recent]) => {
      this.mostUsedNotes = mostUsed || [];
      this.favoriteNotes = favorites || [];
      this.recentNotes = recent || [];
      this.loading = false;
    }).catch(error => {
      console.error('Error loading notes data:', error);
      this.loading = false;
    });
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
  }

  openNote(note: Note, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    // Increment usage count
    this.notesService.incrementUsage(note.id).subscribe({
      next: () => {
        // Optionally refresh the current tab data
        this.refreshCurrentTab();
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

  refreshCurrentTab(): void {
    switch (this.selectedTabIndex) {
      case 0:
        this.notesService.getMostUsed(10).subscribe(notes => {
          this.mostUsedNotes = notes;
        });
        break;
      case 1:
        this.notesService.getFavorites(10).subscribe(notes => {
          this.favoriteNotes = notes;
        });
        break;
      case 2:
        this.notesService.getRecent(10).subscribe(notes => {
          this.recentNotes = notes;
        });
        break;
    }
  }

  trackByNote(index: number, note: Note): number {
    return note.id;
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
