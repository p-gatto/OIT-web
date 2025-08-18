import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { Note } from '../note.models';
import { NotesService } from '../notes.service';
import { NoteDialogComponent } from '../note-dialog/note-dialog.component';

@Component({
  selector: 'app-note-list',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatMenuModule
  ],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.css'
})
export default class NoteListComponent {

  notesService = inject(NotesService);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['name', 'category', 'type', 'stats', 'description', 'dates', 'actions'];
  dataSource = new MatTableDataSource<Note>([]);
  loading = true;

  // Filters
  searchFilter = '';
  areaFilter = '';
  categoryFilter = '';
  typeFilter = '';
  favoriteFilter = '';

  // Filter options
  uniqueAreas: string[] = [];
  uniqueCategories: string[] = [];
  uniqueTypes: string[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Custom filter predicate
    this.dataSource.filterPredicate = (data: Note, filter: string) => {
      const filters = JSON.parse(filter);

      const searchMatch = !filters.search ||
        data.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (data.description && data.description.toLowerCase().includes(filters.search.toLowerCase())) ||
        (data.freeText && data.freeText.toLowerCase().includes(filters.search.toLowerCase())) ||
        data.area.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.category.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.subCategory.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.type.toLowerCase().includes(filters.search.toLowerCase());

      const areaMatch = !filters.area || data.area === filters.area;
      const categoryMatch = !filters.category || data.category === filters.category;
      const typeMatch = !filters.type || data.type === filters.type;

      let favoriteMatch = true;
      if (filters.favorite === 'favorites') {
        favoriteMatch = data.isFavorite;
      } else if (filters.favorite === 'regular') {
        favoriteMatch = !data.isFavorite;
      }

      return searchMatch && areaMatch && categoryMatch && typeMatch && favoriteMatch;
    };
  }

  loadData(): void {
    this.loading = true;
    this.notesService.getAll().subscribe({
      next: (notes) => {
        this.dataSource.data = notes;
        this.updateFilterOptions();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notes:', error);
        this.showSnackBar('Errore nel caricamento delle note');
        this.loading = false;
      }
    });
  }

  updateFilterOptions(): void {
    const data = this.dataSource.data;
    this.uniqueAreas = [...new Set(data.map(note => note.area))].sort();
    this.uniqueCategories = [...new Set(data.map(note => note.category))].sort();
    this.uniqueTypes = [...new Set(data.map(note => note.type))].sort();
  }

  applyFilters(): void {
    const filters = {
      search: this.searchFilter,
      area: this.areaFilter,
      category: this.categoryFilter,
      type: this.typeFilter,
      favorite: this.favoriteFilter
    };

    this.dataSource.filter = JSON.stringify(filters);
  }

  clearFilters(): void {
    this.searchFilter = '';
    this.areaFilter = '';
    this.categoryFilter = '';
    this.typeFilter = '';
    this.favoriteFilter = '';
    this.applyFilters();
  }

  openDialog(note?: Note): void {
    const dialogRef = this.dialog.open(NoteDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: note ? { ...note } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  viewNote(note: Note): void {
    this.notesService.incrementUsage(note.id).subscribe({
      next: () => {
        this.loadData(); // Refresh to show updated usage count
      },
      error: (error) => {
        console.error('Error incrementing usage:', error);
      }
    });

    // Here you could open a detailed view dialog
    // For now, we'll use the edit dialog in view mode
    this.openDialog(note);
  }

  copyToClipboard(note: Note): void {
    const content = note.freeText || note.description || note.name;
    navigator.clipboard.writeText(content).then(() => {
      this.showSnackBar('Contenuto copiato negli appunti');
    }).catch(err => {
      console.error('Error copying to clipboard:', err);
      this.showSnackBar('Errore nella copia');
    });
  }

  toggleFavorite(note: Note): void {
    const updatedNote = {
      name: note.name,
      description: note.description,
      area: note.area,
      category: note.category,
      subCategory: note.subCategory,
      type: note.type,
      freeText: note.freeText,
      isFavorite: !note.isFavorite
    };

    this.notesService.update(note.id, updatedNote).subscribe({
      next: () => {
        this.showSnackBar(
          updatedNote.isFavorite ? 'Nota aggiunta ai preferiti' : 'Nota rimossa dai preferiti'
        );
        this.loadData();
      },
      error: (error) => {
        console.error('Error updating favorite:', error);
        this.showSnackBar('Errore nell\'aggiornamento');
      }
    });
  }

  duplicateNote(note: Note): void {
    const duplicatedNote = {
      name: `${note.name} (Copia)`,
      description: note.description,
      area: note.area,
      category: note.category,
      subCategory: note.subCategory,
      type: note.type,
      freeText: note.freeText,
      isFavorite: false
    };

    this.notesService.create(duplicatedNote).subscribe({
      next: () => {
        this.showSnackBar('Nota duplicata con successo');
        this.loadData();
      },
      error: (error) => {
        console.error('Error duplicating note:', error);
        this.showSnackBar('Errore nella duplicazione');
      }
    });
  }

  deleteNote(note: Note): void {
    if (confirm(`Sei sicuro di voler eliminare "${note.name}"?`)) {
      this.notesService.delete(note.id).subscribe({
        next: () => {
          this.showSnackBar('Nota eliminata con successo');
          this.loadData();
        },
        error: (error) => {
          console.error('Error deleting note:', error);
          this.showSnackBar('Errore nell\'eliminazione');
        }
      });
    }
  }

  /* formatDate(dateString: Date): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
 */
  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Chiudi', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
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