import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from "@angular/material/divider";
import { MatTabsModule } from '@angular/material/tabs';

import { WebLinksService } from '../weblinks/weblinks.service';
import { NotesService } from '../notes/notes.service';

import { Card } from './card.model';
import { CredentialsService } from '../credentials/credentials.service';

import { Credential as CredentialOIT } from '../credentials/models/credential.model';
import { WebLink } from '../weblinks/weblink.models';
import { Note } from '../notes/note.models';
import { filter, interval, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { ItemSectionComponent } from '../../shared/components/item-section/item-section.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ItemCard } from '../../shared/components/item-card/item-card.model';
import { ItemSection } from '../../shared/components/item-section/item-section.model';

@Component({
  selector: 'app-home',
  imports: [
    NgIf,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    MatTabsModule,
    ItemSectionComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export default class HomeComponent {

  private router = inject(Router);
  private credentialsService = inject(CredentialsService);
  private webLinksService = inject(WebLinksService);
  private notesService = inject(NotesService);
  private snackBar = inject(MatSnackBar);

  private destroy$ = new Subject<void>();

  loading = true;
  selectedTabIndex = 0;

  // Dati convertiti per i componenti modulari
  credentialsData: ItemCard[] = [];
  credentialsRecentData: ItemCard[] = [];
  weblinksData: ItemCard[] = [];
  weblinksRecentData: ItemCard[] = [];
  notesData: ItemCard[] = [];
  notesRecentData: ItemCard[] = [];

  // Configurazioni per le sezioni
  credentialsConfig: ItemSection = {
    title: 'Credenziali',
    subtitle: 'Gestisci le tue credenziali di accesso',
    icon: 'vpn_key',
    color: 'credentials-icon',
    cardType: 'credential',
    buttonText: 'Gestisci Credenziali',
    buttonIcon: 'manage_accounts'
  };

  weblinksConfig: ItemSection = {
    title: 'Web Links',
    subtitle: 'Organizza i tuoi collegamenti preferiti',
    icon: 'link',
    color: 'weblinks-icon',
    cardType: 'weblink',
    buttonText: 'Gestisci Links',
    buttonIcon: 'language'
  };

  notesConfig: ItemSection = {
    title: 'Note Tecniche',
    subtitle: 'Conserva e consulta le tue procedure',
    icon: 'note_alt',
    color: 'notes-icon',
    cardType: 'note',
    buttonText: 'Gestisci Note',
    buttonIcon: 'edit_note'
  };

  ngOnInit(): void {
    this.setupAutoRefresh();
    this.setupNavigationListener();
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configura l'auto-refresh dei dati ogni 30 secondi
   */
  private setupAutoRefresh(): void {
    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.loadAllDataSilently()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  /**
   * Ascolta i cambiamenti di navigazione per ricaricare i dati
   */
  private setupNavigationListener(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      filter((event: NavigationEnd) => event.url === '/home' || event.url === '/'),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.refreshCurrentTabData();
    });
  }

  /**
   * Carica tutti i dati mostrando il loading spinner
   */
  private async loadAllData(): Promise<void> {
    this.loading = true;

    try {
      const [
        mostUsedCreds, recentCreds,
        mostUsedLinks, recentLinks,
        mostUsedNotesData, recentNotesData
      ] = await Promise.all([
        this.credentialsService.getMostUsed(10).toPromise(),
        this.credentialsService.getRecent(10).toPromise(),
        this.webLinksService.getMostUsed(10).toPromise(),
        this.webLinksService.getRecent(10).toPromise(),
        this.notesService.getMostUsed(10).toPromise(),
        this.notesService.getRecent(10).toPromise()
      ]);

      // Converti i dati per i componenti modulari
      this.credentialsData = this.convertCredentialsToCardData(mostUsedCreds || []);
      this.credentialsRecentData = this.convertCredentialsToCardData(recentCreds || []);
      this.weblinksData = this.convertWeblinksToCardData(mostUsedLinks || []);
      this.weblinksRecentData = this.convertWeblinksToCardData(recentLinks || []);
      this.notesData = this.convertNotesToCardData(mostUsedNotesData || []);
      this.notesRecentData = this.convertNotesToCardData(recentNotesData || []);

    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      this.showSnackBar('Errore nel caricamento dei dati', 'error');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Carica i dati silenziosamente (senza mostrare il loading)
   */
  private async loadAllDataSilently(): Promise<void> {
    try {
      const [
        mostUsedCreds, recentCreds,
        mostUsedLinks, recentLinks,
        mostUsedNotesData, recentNotesData
      ] = await Promise.all([
        this.credentialsService.getMostUsed(10).toPromise(),
        this.credentialsService.getRecent(10).toPromise(),
        this.webLinksService.getMostUsed(10).toPromise(),
        this.webLinksService.getRecent(10).toPromise(),
        this.notesService.getMostUsed(10).toPromise(),
        this.notesService.getRecent(10).toPromise()
      ]);

      // Aggiorna i dati convertiti
      this.credentialsData = this.convertCredentialsToCardData(mostUsedCreds || []);
      this.credentialsRecentData = this.convertCredentialsToCardData(recentCreds || []);
      this.weblinksData = this.convertWeblinksToCardData(mostUsedLinks || []);
      this.weblinksRecentData = this.convertWeblinksToCardData(recentLinks || []);
      this.notesData = this.convertNotesToCardData(mostUsedNotesData || []);
      this.notesRecentData = this.convertNotesToCardData(recentNotesData || []);

    } catch (error) {
      console.error('Errore nel refresh silenzioso dei dati:', error);
    }
  }

  /**
   * Ricarica solo i dati del tab attualmente selezionato
   */
  private refreshCurrentTabData(): void {
    switch (this.selectedTabIndex) {
      case 0: // Credenziali
        Promise.all([
          this.credentialsService.getMostUsed(10).toPromise(),
          this.credentialsService.getRecent(10).toPromise()
        ]).then(([mostUsed, recent]) => {
          this.credentialsData = this.convertCredentialsToCardData(mostUsed || []);
          this.credentialsRecentData = this.convertCredentialsToCardData(recent || []);
        }).catch(error => {
          console.error('Errore nel refresh delle credenziali:', error);
        });
        break;

      case 1: // Web Links
        Promise.all([
          this.webLinksService.getMostUsed(10).toPromise(),
          this.webLinksService.getRecent(10).toPromise()
        ]).then(([mostUsed, recent]) => {
          this.weblinksData = this.convertWeblinksToCardData(mostUsed || []);
          this.weblinksRecentData = this.convertWeblinksToCardData(recent || []);
        }).catch(error => {
          console.error('Errore nel refresh dei weblinks:', error);
        });
        break;

      case 2: // Note
        Promise.all([
          this.notesService.getMostUsed(10).toPromise(),
          this.notesService.getRecent(10).toPromise()
        ]).then(([mostUsed, recent]) => {
          this.notesData = this.convertNotesToCardData(mostUsed || []);
          this.notesRecentData = this.convertNotesToCardData(recent || []);
        }).catch(error => {
          console.error('Errore nel refresh delle note:', error);
        });
        break;
    }
  }

  /**
   * Metodi di conversione per trasformare i dati specifici in ItemCardData
   */
  private convertCredentialsToCardData(credentials: CredentialOIT[]): ItemCard[] {
    return credentials.map(cred => ({
      id: cred.id,
      name: cred.name,
      description: cred.description,
      category: cred.area,
      subCategory: cred.section,
      area: cred.area,
      usageCount: cred.usageCount,
      lastUsed: cred.lastUsed,
      username: cred.username,
      password: cred.password,
      isFavorite: false
    }));
  }

  private convertWeblinksToCardData(weblinks: WebLink[]): ItemCard[] {
    return weblinks.map(link => ({
      id: link.id,
      name: link.title, // Per i weblinks il nome è il title
      title: link.title,
      description: link.description,
      category: link.category,
      subCategory: link.subCategory,
      area: link.area,
      usageCount: link.usageCount,
      lastUsed: link.lastUsed,
      url: link.url,
      isFavorite: link.isFavorite
    }));
  }

  private convertNotesToCardData(notes: Note[]): ItemCard[] {
    return notes.map(note => ({
      id: note.id,
      name: note.name,
      description: note.description,
      category: note.category,
      subCategory: note.subCategory,
      area: note.area,
      type: note.type,
      usageCount: note.usageCount,
      lastUsed: note.lastUsed,
      freeText: note.freeText,
      isFavorite: note.isFavorite
    }));
  }

  /**
   * Event handlers per le sezioni
   */
  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
    this.refreshCurrentTabData();
  }

  // Navigazione
  onCredentialsNavigate(): void {
    this.router.navigate(['/credentials']);
  }

  onWeblinksNavigate(): void {
    this.router.navigate(['/weblinks']);
  }

  onNotesNavigate(): void {
    this.router.navigate(['/notes']);
  }

  // GESTIONE CLICK SUGLI ITEM - SENZA INCREMENTO
  onCredentialItemClick(item: ItemCard): void {
    console.log('Visualizzazione credenziale:', item.name);
    // Non incrementiamo l'utilizzo per la semplice visualizzazione
  }

  onWeblinkItemClick(item: ItemCard): void {
    console.log('Visualizzazione weblink:', item.name);
    // Non incrementiamo l'utilizzo per la semplice visualizzazione
  }

  onNoteItemClick(item: ItemCard): void {
    console.log('Visualizzazione nota:', item.name);
    // Non incrementiamo l'utilizzo per la semplice visualizzazione
  }

  // GESTIONE AZIONI SPECIFICHE - CON INCREMENTO
  onCredentialActionClick(item: ItemCard): void {
    // Incrementa l'utilizzo quando si apre effettivamente la credenziale
    this.credentialsService.incrementUsage(item.id).subscribe({
      next: () => {
        console.log('✅ Utilizzo credenziale incrementato:', item.name);
        this.refreshCredentialsData();
      },
      error: (error) => console.error('❌ Errore incremento utilizzo:', error)
    });

    console.log('Apertura credenziale:', item.name);
  }

  onWeblinkActionClick(item: ItemCard): void {
    // Incrementa l'utilizzo quando si apre effettivamente il link
    this.webLinksService.incrementUsage(item.id).subscribe({
      next: () => {
        console.log('✅ Utilizzo weblink incrementato:', item.name);
        this.refreshWeblinksData();
      },
      error: (error) => console.error('❌ Errore incremento utilizzo:', error)
    });

    if (item.url) {
      window.open(item.url, '_blank');
    }
    console.log('Apertura weblink:', item.name);
  }

  onNoteActionClick(item: ItemCard): void {
    // Incrementa l'utilizzo quando si usa effettivamente la nota
    this.notesService.incrementUsage(item.id).subscribe({
      next: () => {
        console.log('✅ Utilizzo nota incrementato:', item.name);
        this.refreshNotesData();
      },
      error: (error) => console.error('❌ Errore incremento utilizzo:', error)
    });

    console.log('Apertura nota:', item.name);
  }

  // GESTIONE COPIA - CON INCREMENTO
  onCopyClick(text: string, item?: ItemCard): void {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        this.showSnackBar('Contenuto copiato negli appunti', 'success');

        // Incrementa l'utilizzo SOLO quando si copia effettivamente
        if (item) {
          // Determina il tipo di item e incrementa l'utilizzo
          if (item.username && item.password) {
            // È una credenziale
            this.credentialsService.incrementUsage(item.id).subscribe({
              next: () => {
                console.log('✅ Utilizzo credenziale incrementato per copia:', item.name);
                this.refreshCredentialsData();
              },
              error: (error) => console.error('❌ Errore incremento utilizzo:', error)
            });
          } else if (item.freeText) {
            // È una nota
            this.notesService.incrementUsage(item.id).subscribe({
              next: () => {
                console.log('✅ Utilizzo nota incrementato per copia:', item.name);
                this.refreshNotesData();
              },
              error: (error) => console.error('❌ Errore incremento utilizzo:', error)
            });
          }
          // Per i weblinks, l'incremento avviene solo sull'apertura del link
        }
      }).catch(err => {
        console.error('Errore nella copia:', err);
        this.showSnackBar('Errore durante la copia', 'error');
      });
    } else {
      this.showSnackBar('Nessun contenuto da copiare', 'info');
    }
  }

  /**
   * Metodi di refresh specifici per ogni sezione
   */
  private refreshCredentialsData(): void {
    Promise.all([
      this.credentialsService.getMostUsed(10).toPromise(),
      this.credentialsService.getRecent(10).toPromise()
    ]).then(([mostUsed, recent]) => {
      this.credentialsData = this.convertCredentialsToCardData(mostUsed || []);
      this.credentialsRecentData = this.convertCredentialsToCardData(recent || []);
    });
  }

  private refreshWeblinksData(): void {
    Promise.all([
      this.webLinksService.getMostUsed(10).toPromise(),
      this.webLinksService.getRecent(10).toPromise()
    ]).then(([mostUsed, recent]) => {
      this.weblinksData = this.convertWeblinksToCardData(mostUsed || []);
      this.weblinksRecentData = this.convertWeblinksToCardData(recent || []);
    });
  }

  private refreshNotesData(): void {
    Promise.all([
      this.notesService.getMostUsed(10).toPromise(),
      this.notesService.getRecent(10).toPromise()
    ]).then(([mostUsed, recent]) => {
      this.notesData = this.convertNotesToCardData(mostUsed || []);
      this.notesRecentData = this.convertNotesToCardData(recent || []);
    });
  }

  /**
   * Metodo pubblico per forzare il refresh (utilizzabile da altri componenti)
   */
  public forceRefresh(): void {
    this.loadAllDataSilently();
  }

  /**
   * Utility per mostrare snackbar
   */
  private showSnackBar(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const panelClass = type === 'success' ? ['success-snackbar'] :
      type === 'error' ? ['error-snackbar'] : ['info-snackbar'];

    this.snackBar.open(message, 'Chiudi', {
      duration: 4000,
      panelClass,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

}