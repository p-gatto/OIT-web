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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from "@angular/material/tooltip";

import { Credential as CredentialModel } from "./models/credential.model";
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
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './credentials.component.html',
  styleUrl: './credentials.component.css'
})
export default class CredentialsComponent implements OnInit {

  credentialsService = inject(CredentialsService);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);

  dataSource = new MatTableDataSource<CredentialModel>([]);
  // Array aggiornato con le nuove colonne 'description' e 'password'
  displayedColumns: string[] = ['name', 'description', 'username', 'password', 'email', 'url', 'active', 'expired', 'actions'];
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

  openDialog(credential?: CredentialModel): void {
    const dialogRef = this.dialog.open(CredentialDialogComponent, {
      width: '95vw',           // 95% della larghezza del viewport
      maxWidth: '1400px',      // Larghezza massima in pixel
      height: '90vh',          // 90% dell'altezza del viewport
      maxHeight: '900px',      // Altezza massima in pixel
      panelClass: 'credential-dialog-container', // Classe CSS personalizzata
      disableClose: false,     // Permette di chiudere con ESC o click fuori
      hasBackdrop: true,       // Mantiene il backdrop
      backdropClass: 'credential-dialog-backdrop', // Classe personalizzata per il backdrop
      data: credential ? { ...credential } : {}
    });

    dialogRef.afterClosed().subscribe(crdential => {
      if (crdential) {
        if (crdential.id) {
          // Update existing credential
          this.credentialsService.updateCredential(crdential.id, crdential).subscribe({
            next: () => {
              this.showSuccessMessage(`Credenziale "${crdential.name}" modificata con successo!!!`);
              this.loadCredentials()
            },
            error: (error) => {
              console.error('Error updating credential', error);
              this.showErrorMessage('Errore durante la modifica della credenziale');
              this.loading = false;
            }
          });
        } else {
          // Create new credential
          this.credentialsService.createCredential(crdential).subscribe({
            next: () => {
              this.showSuccessMessage(`Credenziale "${crdential.name}" creata con successo!!!`);
              this.loadCredentials()
            },
            error: (error) => {
              console.error('Error creating credential', error);
              this.showErrorMessage('Errore durante la creazione della credenziale');
              this.loading = false;
            }
          });
        }
      }
    });
  }

  deleteCredential(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Conferma Eliminazione',
        message: `Sei sicuro di voler eliminare definitivamente la credenziale con id "${id}"?\n\nQuesta operazione non può essere annullata.`,
        confirmText: 'Elimina',
        cancelText: 'Annulla',
        type: 'delete'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.credentialsService.deleteCredential(id).subscribe({
          next: () => {
            this.showSuccessMessage(`Credenziale con id "${id}" è stata eliminata con successo!!!`)
            this.loadCredentials()
          },
          error: (error) => console.error('Error deleting credential', error)
        });
      }
    });
  }

  /**
   * Nuovo metodo per copiare la password negli appunti
   */
  copyToClipboard(password: string, event: Event): void {
    event.stopPropagation(); // Evita che si propaghi l'evento al parent

    if (password) {
      navigator.clipboard.writeText(password).then(() => {
        this.showSuccessMessage('Password copiata negli appunti');
      }).catch(err => {
        console.error('Errore nella copia della password:', err);
        this.showErrorMessage('Errore durante la copia della password');
      });
    } else {
      this.showInfoMessage('Nessuna password da copiare');
    }
  }

  /**
   * Metodo per duplicare una credenziale
   */
  duplicateCredential(credential: CredentialModel): void {
    // Crea una copia della credenziale senza l'ID e con nome modificato
    const duplicatedCredential = {
      ...credential,
      id: undefined, // Rimuove l'ID per creare un nuovo record
      name: `${credential.name} (Copia)`, // Modifica il nome aggiungendo "(Copia)"
      created: undefined, // Rimuove le date che verranno generate automaticamente
      modified: undefined
    };

    // Apre il dialog in modalità "creazione" con i dati duplicati
    const dialogRef = this.dialog.open(CredentialDialogComponent, {
      width: '95vw',
      maxWidth: '1400px',
      height: '90vh',
      maxHeight: '900px',
      panelClass: 'credential-dialog-container',
      disableClose: false,
      hasBackdrop: true,
      backdropClass: 'credential-dialog-backdrop',
      data: duplicatedCredential // Passa i dati duplicati
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Crea la nuova credenziale
        this.credentialsService.createCredential(result).subscribe({
          next: () => {
            this.showSuccessMessage(`Credenziale "${result.name}" duplicata con successo!`);
            this.loadCredentials();
          },
          error: (error) => {
            console.error('Error duplicating credential', error);
            this.showErrorMessage('Errore durante la duplicazione della credenziale');
          }
        });
      }
    });
  }

  /**
   * Metodo rinominato per copiare la credenziale negli appunti (per distinguerla dalla duplicazione)
   */
  copyCredentialToClipboard(credential: CredentialModel): void {
    const credentialText = this.formatCredentialForCopy(credential);

    navigator.clipboard.writeText(credentialText).then(() => {
      this.showSuccessMessage(`Credenziale "${credential.name}" copiata negli appunti`);
    }).catch(err => {
      console.error('Errore nella copia della credenziale:', err);
      this.showErrorMessage('Errore durante la copia della credenziale');
    });
  }

  /**
   * Formatta la credenziale per la copia negli appunti
   */
  private formatCredentialForCopy(credential: CredentialModel): string {
    const lines: string[] = [];

    lines.push(`Nome: ${credential.name}`);

    if (credential.description) {
      lines.push(`Descrizione: ${credential.description}`);
    }

    lines.push(`Username: ${credential.username}`);
    lines.push(`Password: ${credential.password}`);

    if (credential.email) {
      lines.push(`Email: ${credential.email}`);
    }

    if (credential.url) {
      lines.push(`URL: ${credential.url}`);
    }

    if (credential.profile) {
      lines.push(`Profile: ${credential.profile}`);
    }

    // Aggiungi altre informazioni se presenti
    if (credential.subject_ID) {
      lines.push(`Subject ID: ${credential.subject_ID}`);
    }

    if (credential.nickname) {
      lines.push(`Nickname: ${credential.nickname}`);
    }

    if (credential.operativity) {
      lines.push(`Operatività: ${credential.operativity}`);
    }

    if (credential.area) {
      lines.push(`Area: ${credential.area}`);
    }

    if (credential.section) {
      lines.push(`Sezione: ${credential.section}`);
    }

    if (credential.user_Admin) {
      lines.push(`User Admin: ${credential.user_Admin}`);
    }

    // Informazioni bancarie
    if (credential.iban) {
      lines.push(`IBAN: ${credential.iban}`);
    }

    if (credential.numero_Carta) {
      lines.push(`Numero Carta: ${credential.numero_Carta}`);
    }

    if (credential.data_Scadenza) {
      lines.push(`Data Scadenza: ${credential.data_Scadenza}`);
    }

    // PIN vari
    if (credential.pin_App) {
      lines.push(`PIN App: ${credential.pin_App}`);
    }

    if (credential.pin_Carta) {
      lines.push(`PIN Carta: ${credential.pin_Carta}`);
    }

    if (credential.pin) {
      lines.push(`PIN: ${credential.pin}`);
    }

    // Informazioni macchina
    if (credential.machine_IP) {
      lines.push(`IP Macchina: ${credential.machine_IP}`);
    }

    if (credential.machine_Name) {
      lines.push(`Nome Macchina: ${credential.machine_Name}`);
    }

    if (credential.machine_Type) {
      lines.push(`Tipo Macchina: ${credential.machine_Type}`);
    }

    // Note
    if (credential.note) {
      lines.push(`Note: ${credential.note}`);
    }

    // Data di scadenza
    if (credential.expired_Date) {
      lines.push(`Data Scadenza: ${new Date(credential.expired_Date).toLocaleDateString('it-IT')}`);
    }

    // Stato
    lines.push(`Attivo: ${credential.active ? 'Sì' : 'No'}`);
    lines.push(`Scaduto: ${credential.expired ? 'Sì' : 'No'}`);

    return lines.join('\n');
  }

  /**
   * Mostra un messaggio di successo
   */
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Chiudi', {
      duration: 4000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Mostra un messaggio di errore
   */
  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Chiudi', {
      duration: 6000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Mostra un messaggio informativo
   */
  private showInfoMessage(message: string): void {
    this.snackBar.open(message, 'Chiudi', {
      duration: 3000,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  toggleVisibility(password: string): string {
    return '••••••••';
  }
}