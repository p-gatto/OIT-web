import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { CredentialFilterDto } from './dtos/credential-filter-dto.model';
import { CredentialsService } from './credentials.service';
import { CredentialDialogComponent } from './dialogs/credential-dialog/credential-dialog.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-credentials',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './credentials.component.html',
  styleUrl: './credentials.component.css'
})
export class CredentialsComponent implements OnInit {

  credentialsService = inject(CredentialsService);
  dialog = inject(MatDialog);

  dataSource = new MatTableDataSource<Credential>([]);
  displayedColumns: string[] = ['name', 'username', 'email', 'url', 'active', 'expired', 'actions'];
  totalCount = 0;
  loading = false;

  filter: CredentialFilterDto = {
    pageIndex: 1,
    pageSize: 10,
    sortField: 'name',
    sortAscending: true
  };

  searchSubject = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() { }

  ngOnInit(): void {

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filter.searchTerm = searchTerm;
      this.filter.pageIndex = 1;
      this.loadCredentials();
    });

    this.loadCredentials();
  }

  loadCredentials(): void {
    this.loading = true;
    this.credentialsService.getCredentials(this.filter).subscribe({
      next: (result) => {
        this.dataSource.data = result.items;
        this.totalCount = result.totalCount;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading credentials', error);
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.filter.pageIndex = event.pageIndex + 1;
    this.filter.pageSize = event.pageSize;
    this.loadCredentials();
  }

  onSortChange(sort: Sort): void {
    this.filter.sortField = sort.active;
    this.filter.sortAscending = sort.direction === 'asc';
    this.loadCredentials();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue.trim().toLowerCase());
  }

  openDialog(credential?: Credential): void {
    const dialogRef = this.dialog.open(CredentialDialogComponent, {
      width: '500px',
      data: credential ? { ...credential } : {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          // Update existing credential
          this.credentialsService.updateCredential(result.id, result).subscribe({
            next: () => this.loadCredentials(),
            error: (error) => console.error('Error updating credential', error)
          });
        } else {
          // Create new credential
          this.credentialsService.createCredential(result).subscribe({
            next: () => this.loadCredentials(),
            error: (error) => console.error('Error creating credential', error)
          });
        }
      }
    });
  }

  deleteCredential(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Conferma', message: 'Sei sicuro di voler eliminare questa credenziale?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.credentialsService.deleteCredential(id).subscribe({
          next: () => this.loadCredentials(),
          error: (error) => console.error('Error deleting credential', error)
        });
      }
    });
  }

  toggleVisibility(password: string): string {
    return '••••••••';
  }
}