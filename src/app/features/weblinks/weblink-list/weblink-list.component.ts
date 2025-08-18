import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
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
import { WebLink } from '../weblink.models';
import { WebLinksService } from '../weblinks.service';
import { MatDividerModule } from '@angular/material/divider';
import WeblinkDialogComponent from '../weblink-dialog/weblink-dialog.component';

@Component({
  selector: 'app-weblinks-list',
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
  templateUrl: './weblink-list.component.html',
  styleUrl: './weblink-list.component.css'
})
export default class WeblinksListComponent {

  webLinksService = inject(WebLinksService);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['title', 'category', 'stats', 'description', 'dates', 'actions'];
  dataSource = new MatTableDataSource<WebLink>([]);
  loading = true;

  // Filters
  searchFilter = '';
  areaFilter = '';
  categoryFilter = '';
  favoriteFilter = '';

  // Filter options
  uniqueAreas: string[] = [];
  uniqueCategories: string[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Custom filter predicate
    this.dataSource.filterPredicate = (data: WebLink, filter: string) => {
      const filters = JSON.parse(filter);

      const searchMatch = !filters.search ||
        data.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.url.toLowerCase().includes(filters.search.toLowerCase()) ||
        (data.description && data.description.toLowerCase().includes(filters.search.toLowerCase())) ||
        data.area.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.category.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.subCategory.toLowerCase().includes(filters.search.toLowerCase());

      const areaMatch = !filters.area || data.area === filters.area;
      const categoryMatch = !filters.category || data.category === filters.category;

      let favoriteMatch = true;
      if (filters.favorite === 'favorites') {
        favoriteMatch = data.isFavorite;
      } else if (filters.favorite === 'regular') {
        favoriteMatch = !data.isFavorite;
      }

      return searchMatch && areaMatch && categoryMatch && favoriteMatch;
    };
  }

  loadData(): void {
    this.loading = true;
    this.webLinksService.getAll().subscribe({
      next: (links) => {
        this.dataSource.data = links;
        this.updateFilterOptions();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading links:', error);
        this.showSnackBar('Errore nel caricamento dei link');
        this.loading = false;
      }
    });
  }

  updateFilterOptions(): void {
    const data = this.dataSource.data;
    this.uniqueAreas = [...new Set(data.map(link => link.area))].sort();
    this.uniqueCategories = [...new Set(data.map(link => link.category))].sort();
  }

  applyFilters(): void {
    const filters = {
      search: this.searchFilter,
      area: this.areaFilter,
      category: this.categoryFilter,
      favorite: this.favoriteFilter
    };

    this.dataSource.filter = JSON.stringify(filters);
  }

  clearFilters(): void {
    this.searchFilter = '';
    this.areaFilter = '';
    this.categoryFilter = '';
    this.favoriteFilter = '';
    this.applyFilters();
  }

  openDialog(link?: WebLink): void {
    const dialogRef = this.dialog.open(WeblinkDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: link ? { ...link } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  openLink(link: WebLink): void {
    this.webLinksService.incrementUsage(link.id).subscribe({
      next: () => {
        this.loadData(); // Refresh to show updated usage count
      },
      error: (error) => {
        console.error('Error incrementing usage:', error);
      }
    });

    window.open(link.url, '_blank');
  }

  toggleFavorite(link: WebLink): void {
    const updatedLink = {
      url: link.url,
      title: link.title,
      description: link.description,
      area: link.area,
      category: link.category,
      subCategory: link.subCategory,
      isFavorite: !link.isFavorite
    };

    this.webLinksService.update(link.id, updatedLink).subscribe({
      next: () => {
        this.showSnackBar(
          updatedLink.isFavorite ? 'Link aggiunto ai preferiti' : 'Link rimosso dai preferiti'
        );
        this.loadData();
      },
      error: (error) => {
        console.error('Error updating favorite:', error);
        this.showSnackBar('Errore nell\'aggiornamento');
      }
    });
  }

  duplicateLink(link: WebLink): void {
    const duplicatedLink = {
      url: link.url,
      title: `${link.title} (Copia)`,
      description: link.description,
      area: link.area,
      category: link.category,
      subCategory: link.subCategory,
      isFavorite: false
    };

    this.webLinksService.create(duplicatedLink).subscribe({
      next: () => {
        this.showSnackBar('Link duplicato con successo');
        this.loadData();
      },
      error: (error) => {
        console.error('Error duplicating link:', error);
        this.showSnackBar('Errore nella duplicazione');
      }
    });
  }

  deleteLink(link: WebLink): void {
    if (confirm(`Sei sicuro di voler eliminare "${link.title}"?`)) {
      this.webLinksService.delete(link.id).subscribe({
        next: () => {
          this.showSnackBar('Link eliminato con successo');
          this.loadData();
        },
        error: (error) => {
          console.error('Error deleting link:', error);
          this.showSnackBar('Errore nell\'eliminazione');
        }
      });
    }
  }

  formatDate(dateString: Date): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Chiudi', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

}