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

  viewCredential(credential: CredentialModel): void {
    // Visualizza la credenziale SENZA incrementare le statistiche
    console.log('Visualizzazione credenziale:', credential.name);

    // Apri il dialog in modalità di sola lettura/visualizzazione
    const dialogRef = this.dialog.open(CredentialDialogComponent, {
      width: '95vw',
      maxWidth: '1400px',
      height: '90vh',
      maxHeight: '900px',
      panelClass: 'credential-dialog-container',
      disableClose: false,
      hasBackdrop: true,
      backdropClass: 'credential-dialog-backdrop',
      data: { ...credential, readOnly: true } // Aggiungi flag per modalità read-only
    });

    // Non incrementare l'utilizzo per la sola visualizzazione
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.id) {
        // Solo se l'utente ha modificato qualcosa
        this.loadCredentials();
      }
    });
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
      width: '95vw',
      maxWidth: '1400px',
      height: '90vh',
      maxHeight: '900px',
      panelClass: 'credential-dialog-container',
      disableClose: false,
      hasBackdrop: true,
      backdropClass: 'credential-dialog-backdrop',
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

  copyPasswordOnly(credential: CredentialModel, event: Event): void {
    event.stopPropagation();

    navigator.clipboard.writeText(credential.password).then(() => {
      this.showSuccessMessage('Password copiata negli appunti');

      // MANTIENI l'incremento per la copia - è un utilizzo effettivo
      this.credentialsService.incrementUsage(credential.id).subscribe({
        next: () => {
          console.log('✅ Utilizzo incrementato per:', credential.name);
          this.loadCredentials();
        },
        error: (error) => console.error('❌ Errore incremento utilizzo:', error)
      });
    }).catch(err => {
      console.error('Errore nella copia della password:', err);
      this.showErrorMessage('Errore durante la copia della password');
    });
  }

  copyUsernameOnly(credential: CredentialModel, event: Event): void {
    event.stopPropagation();

    navigator.clipboard.writeText(credential.username).then(() => {
      this.showSuccessMessage('Username copiato negli appunti');

      // MANTIENI l'incremento per la copia - è un utilizzo effettivo
      this.credentialsService.incrementUsage(credential.id).subscribe({
        next: () => {
          console.log('✅ Utilizzo incrementato per:', credential.name);
          this.loadCredentials();
        },
        error: (error) => console.error('❌ Errore incremento utilizzo:', error)
      });
    }).catch(err => {
      console.error('Errore nella copia dell\'username:', err);
      this.showErrorMessage('Errore durante la copia dell\'username');
    });
  }

  copyToClipboard(password: string, event: Event, credential?: CredentialModel): void {
    event.stopPropagation();

    if (credential) {
      const credentialText = `Username: ${credential.username}\nPassword: ${credential.password}`;

      navigator.clipboard.writeText(credentialText).then(() => {
        this.showSuccessMessage('Username e Password copiati negli appunti');

        if (credential.id) {
          console.log('🔄 Incremento utilizzo per credenziale:', credential.name);

          // MANTIENI l'incremento per la copia - è un utilizzo effettivo
          this.credentialsService.incrementUsage(credential.id).subscribe({
            next: () => {
              console.log('✅ Utilizzo incrementato con successo');
              this.loadCredentials();
            },
            error: (error) => {
              console.error('❌ Errore incremento utilizzo:', error);
            }
          });
        }
      }).catch(err => {
        console.error('Errore nella copia delle credenziali:', err);
        this.showErrorMessage('Errore durante la copia delle credenziali');
      });
    } else if (password) {
      navigator.clipboard.writeText(password).then(() => {
        this.showSuccessMessage('Password copiata negli appunti');
      }).catch(err => {
        console.error('Errore nella copia della password:', err);
        this.showErrorMessage('Errore durante la copia della password');
      });
    } else {
      this.showInfoMessage('Nessuna credenziale da copiare');
    }
  }

  copyCredentialDetails(credential: CredentialModel): void {
    const credentialDetails = this.formatCredentialForCopy(credential);

    navigator.clipboard.writeText(credentialDetails).then(() => {
      this.showSuccessMessage(`Dettagli completi di "${credential.name}" copiati negli appunti`);

      this.credentialsService.incrementUsage(credential.id).subscribe({
        next: () => {
          console.log('✅ Utilizzo incrementato per:', credential.name);
          this.loadCredentials();
        },
        error: (error) => {
          console.error('❌ Errore incremento utilizzo:', error);
        }
      });
    }).catch(err => {
      console.error('Errore nella copia dei dettagli:', err);
      this.showErrorMessage('Errore durante la copia dei dettagli');
    });
  }
  /**
   * Metodo alternativo per incrementare l'utilizzo quando si copia una password
   * dal componente home o da altri componenti
   */
  copyPasswordAndIncrementUsage(credential: CredentialModel, fieldName: string = 'password'): void {
    const password = this.getPasswordField(credential, fieldName);

    if (password) {
      navigator.clipboard.writeText(password).then(() => {
        this.showSuccessMessage(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} copiata negli appunti`);

        // Incrementa sempre l'utilizzo quando si copia una password
        this.credentialsService.incrementUsage(credential.id).subscribe({
          next: () => {
            console.log('✅ Utilizzo incrementato per:', credential.name);
            // Ricarica i dati se necessario
            this.loadCredentials();
          },
          error: (error) => {
            console.error('❌ Errore incremento utilizzo:', error);
          }
        });
      }).catch(err => {
        console.error('Errore nella copia:', err);
        this.showErrorMessage('Errore durante la copia');
      });
    } else {
      this.showInfoMessage(`Nessuna ${fieldName} da copiare`);
    }
  }

  /**
   * Metodo helper per ottenere il campo password specifico
   */
  private getPasswordField(credential: CredentialModel, fieldName: string): string {
    switch (fieldName.toLowerCase()) {
      case 'password':
        return credential.password;
      case 'password_admin':
        return credential.password_Admin || '';
      case 'password_first':
        return credential.password_First || '';
      case 'password_3d_secure':
        return credential.password_3D_Secure || '';
      case 'password_dispositiva':
        return credential.password_Dispositiva || '';
      case 'pin':
        return credential.pin || '';
      case 'pin_app':
        return credential.pin_App || '';
      case 'pin_carta':
        return credential.pin_Carta || '';
      case 'puk':
        return credential.puk || '';
      default:
        return credential.password;
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

    lines.push(`=== ${credential.name.toUpperCase()} ===`);
    lines.push('');

    lines.push(`Username: ${credential.username}`);
    lines.push(`Password: ${credential.password}`);

    if (credential.email) {
      lines.push(`Email: ${credential.email}`);
    }

    if (credential.url) {
      lines.push(`URL: ${credential.url}`);
    }

    if (credential.description) {
      lines.push('');
      lines.push(`Descrizione: ${credential.description}`);
    }

    if (credential.user_Admin) {
      lines.push(`User Admin: ${credential.user_Admin}`);
    }

    if (credential.password_Admin) {
      lines.push(`Password Admin: ${credential.password_Admin}`);
    }

    if (credential.note) {
      lines.push('');
      lines.push(`Note: ${credential.note}`);
    }

    lines.push('');
    lines.push(`Copiato il: ${new Date().toLocaleString('it-IT')}`);

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