import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from "@angular/material/divider";

import { WebLinksService } from '../weblinks/weblinks.service';
import { NotesService } from '../notes/notes.service';

import { Card } from './card.model';
import { CredentialsService } from '../credentials/credentials.service';

import { Credential as CredentialOIT } from '../credentials/models/credential.model';
import { WebLink } from '../weblinks/weblink.models';
import { Note } from '../notes/note.models';

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
    MatDividerModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export default class HomeComponent {

  router = inject(Router);
  credentialsService = inject(CredentialsService);
  webLinksService = inject(WebLinksService);
  notesService = inject(NotesService);

  loading = true;

  // Dati per le tre sezioni
  mostUsedCredentials: CredentialOIT[] = [];
  recentCredentials: CredentialOIT[] = [];

  mostUsedWeblinks: WebLink[] = [];
  recentWeblinks: WebLink[] = [];

  mostUsedNotes: Note[] = [];
  recentNotes: Note[] = [];

  ngOnInit(): void {
    this.loadAllData();
  }

  private async loadAllData(): Promise<void> {
    this.loading = true;

    try {
      // Carica tutti i dati in parallelo
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

      // Assegna i risultati
      this.mostUsedCredentials = mostUsedCreds || [];
      this.recentCredentials = recentCreds || [];

      this.mostUsedWeblinks = mostUsedLinks || [];
      this.recentWeblinks = recentLinks || [];

      this.mostUsedNotes = mostUsedNotesData || [];
      this.recentNotes = recentNotesData || [];

    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
    } finally {
      this.loading = false;
    }
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

  // Metodi per aprire/utilizzare gli elementi
  openCredential(credential: CredentialOIT): void {
    // Incrementa il contatore di utilizzo
    this.credentialsService.incrementUsage(credential.id).subscribe({
      next: () => {
        console.log('Utilizzo credenziale incrementato');
        // Opzionalmente ricarica i dati per vedere l'aggiornamento
        // this.loadAllData();
      },
      error: (error) => console.error('Errore incremento utilizzo:', error)
    });

    // Qui potresti aprire un dialog con i dettagli della credenziale
    // o copiare negli appunti
    console.log('Apertura credenziale:', credential.name);
  }

  openWeblink(weblink: WebLink): void {
    // Incrementa il contatore di utilizzo
    this.webLinksService.incrementUsage(weblink.id).subscribe({
      next: () => {
        console.log('Utilizzo weblink incrementato');
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
      },
      error: (error) => console.error('Errore incremento utilizzo:', error)
    });

    // Qui potresti aprire un dialog con il contenuto della nota
    console.log('Apertura nota:', note.name);
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