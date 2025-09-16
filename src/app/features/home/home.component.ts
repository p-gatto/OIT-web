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
    MatTabsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export default class HomeComponent {

  private router = inject(Router);
  private credentialsService = inject(CredentialsService);
  private webLinksService = inject(WebLinksService);
  private notesService = inject(NotesService);

  private destroy$ = new Subject<void>();

  loading = true;
  selectedTabIndex = 0;

  // Dati per le tre sezioni
  mostUsedCredentials: CredentialOIT[] = [];
  recentCredentials: CredentialOIT[] = [];

  mostUsedWeblinks: WebLink[] = [];
  recentWeblinks: WebLink[] = [];

  mostUsedNotes: Note[] = [];
  recentNotes: Note[] = [];

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
   * e al ritorno sulla home page
   */
  private setupAutoRefresh(): void {
    // Auto-refresh ogni 30 secondi quando la home è visibile
    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.loadAllDataSilently()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  /**
   * Ascolta i cambiamenti di navigazione per ricaricare i dati
   * quando si torna sulla home page
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
        // Credentials
        this.credentialsService.getMostUsed(10).toPromise(),
        this.credentialsService.getRecent(10).toPromise(),

        // WebLinks
        this.webLinksService.getMostUsed(10).toPromise(),
        this.webLinksService.getRecent(10).toPromise(),

        // Notes
        this.notesService.getMostUsed(10).toPromise(),
        this.notesService.getRecent(10).toPromise()
      ]);

      this.updateData({
        mostUsedCreds, recentCreds,
        mostUsedLinks, recentLinks,
        mostUsedNotesData, recentNotesData
      });

    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
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
        // Credentials
        this.credentialsService.getMostUsed(10).toPromise(),
        this.credentialsService.getRecent(10).toPromise(),

        // WebLinks
        this.webLinksService.getMostUsed(10).toPromise(),
        this.webLinksService.getRecent(10).toPromise(),

        // Notes
        this.notesService.getMostUsed(10).toPromise(),
        this.notesService.getRecent(10).toPromise()
      ]);

      this.updateData({
        mostUsedCreds, recentCreds,
        mostUsedLinks, recentLinks,
        mostUsedNotesData, recentNotesData
      });

    } catch (error) {
      console.error('Errore nel refresh silenzioso dei dati:', error);
    }
  }

  /**
   * Aggiorna i dati nelle proprietà del componente
   */
  private updateData(data: {
    mostUsedCreds: CredentialOIT[] | undefined,
    recentCreds: CredentialOIT[] | undefined,
    mostUsedLinks: WebLink[] | undefined,
    recentLinks: WebLink[] | undefined,
    mostUsedNotesData: Note[] | undefined,
    recentNotesData: Note[] | undefined
  }): void {
    this.mostUsedCredentials = data.mostUsedCreds || [];
    this.recentCredentials = data.recentCreds || [];
    this.mostUsedWeblinks = data.mostUsedLinks || [];
    this.recentWeblinks = data.recentLinks || [];
    this.mostUsedNotes = data.mostUsedNotesData || [];
    this.recentNotes = data.recentNotesData || [];
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
          this.mostUsedCredentials = mostUsed || [];
          this.recentCredentials = recent || [];
        }).catch(error => {
          console.error('Errore nel refresh delle credenziali:', error);
        });
        break;

      case 1: // Web Links
        Promise.all([
          this.webLinksService.getMostUsed(10).toPromise(),
          this.webLinksService.getRecent(10).toPromise()
        ]).then(([mostUsed, recent]) => {
          this.mostUsedWeblinks = mostUsed || [];
          this.recentWeblinks = recent || [];
        }).catch(error => {
          console.error('Errore nel refresh dei weblinks:', error);
        });
        break;

      case 2: // Note
        Promise.all([
          this.notesService.getMostUsed(10).toPromise(),
          this.notesService.getRecent(10).toPromise()
        ]).then(([mostUsed, recent]) => {
          this.mostUsedNotes = mostUsed || [];
          this.recentNotes = recent || [];
        }).catch(error => {
          console.error('Errore nel refresh delle note:', error);
        });
        break;
    }
  }

  /**
   * Metodo pubblico per forzare il refresh (utilizzabile da altri componenti)
   */
  public forceRefresh(): void {
    this.loadAllDataSilently();
  }

  /**
   * Metodo per gestire il cambio di tab con refresh dei dati
   */
  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
    // Ricarica i dati del nuovo tab selezionato
    this.refreshCurrentTabData();
  }

  // Metodi di navigazione
  navigateToCredentials(): void {
    this.router.navigate(['/credentials']);
  }

  navigateToWeblinks(): void {
    this.router.navigate(['/weblinks']);
  }

  navigateToNotes(): void {
    this.router.navigate(['/notes']);
  }

  // Metodi per aprire/utilizzare gli elementi con refresh immediato
  openCredential(credential: CredentialOIT): void {
    // Incrementa il contatore di utilizzo
    this.credentialsService.incrementUsage(credential.id).subscribe({
      next: () => {
        console.log('Utilizzo credenziale incrementato');
        // Refresh immediato delle credenziali
        this.refreshCredentialsData();
      },
      error: (error) => console.error('Errore incremento utilizzo:', error)
    });

    console.log('Apertura credenziale:', credential.name);
  }

  openWeblink(weblink: WebLink): void {
    // Incrementa il contatore di utilizzo
    this.webLinksService.incrementUsage(weblink.id).subscribe({
      next: () => {
        console.log('Utilizzo weblink incrementato');
        // Refresh immediato dei weblinks
        this.refreshWeblinksData();
      },
      error: (error) => console.error('Errore incremento utilizzo:', error)
    });

    // Apri il link in una nuova tab
    window.open(weblink.url, '_blank');
  }

  openNote(note: Note): void {
    // Incrementa il contatore di utilizzo
    this.notesService.incrementUsage(note.id).subscribe({
      next: () => {
        console.log('Utilizzo nota incrementato');
        // Refresh immediato delle note
        this.refreshNotesData();
      },
      error: (error) => console.error('Errore incremento utilizzo:', error)
    });

    console.log('Apertura nota:', note.name);
  }

  /**
   * Metodi di refresh specifici per ogni sezione
   */
  private refreshCredentialsData(): void {
    Promise.all([
      this.credentialsService.getMostUsed(10).toPromise(),
      this.credentialsService.getRecent(10).toPromise()
    ]).then(([mostUsed, recent]) => {
      this.mostUsedCredentials = mostUsed || [];
      this.recentCredentials = recent || [];
    });
  }

  private refreshWeblinksData(): void {
    Promise.all([
      this.webLinksService.getMostUsed(10).toPromise(),
      this.webLinksService.getRecent(10).toPromise()
    ]).then(([mostUsed, recent]) => {
      this.mostUsedWeblinks = mostUsed || [];
      this.recentWeblinks = recent || [];
    });
  }

  private refreshNotesData(): void {
    Promise.all([
      this.notesService.getMostUsed(10).toPromise(),
      this.notesService.getRecent(10).toPromise()
    ]).then(([mostUsed, recent]) => {
      this.mostUsedNotes = mostUsed || [];
      this.recentNotes = recent || [];
    });
  }

  // Metodi di utilità per la formattazione
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

  // TrackBy functions per migliorare le performance
  trackByCredential(index: number, credential: CredentialOIT): number {
    return credential.id;
  }

  trackByWeblink(index: number, weblink: WebLink): number {
    return weblink.id;
  }

  trackByNote(index: number, note: Note): number {
    return note.id;
  }


}