import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { WebLinksService } from '../weblinks/weblinks.service';
import { NotesService } from '../notes/notes.service';

import { Card } from './card.model';

@Component({
  selector: 'app-home',
  imports: [
    NgIf,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export default class HomeComponent {

  router = inject(Router);
  webLinksService = inject(WebLinksService);
  notesService = inject(NotesService);

  loading = true;
  moduleCards: Card[] = [];

  // Configurazione base dei moduli
  private baseModules: Omit<Card, 'count' | 'lastUsed'>[] = [
    {
      id: 'weblinks',
      title: 'Web Links',
      description: 'Gestisci e organizza i tuoi link web preferiti con categorie e statistiche d\'uso',
      icon: 'link',
      route: '/weblinks',
      color: 'from-blue-500 to-blue-600',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      isActive: true
    },
    {
      id: 'notes',
      title: 'Note Tecniche',
      description: 'Organizza comandi, procedure e note tecniche per tipo e categoria',
      icon: 'note_alt',
      route: '/notes',
      color: 'from-green-500 to-green-600',
      gradient: 'bg-gradient-to-br from-green-500 to-green-600',
      isActive: true
    },
    {
      id: 'credentials',
      title: 'Credenziali',
      description: 'Gestione sicura delle credenziali e informazioni di accesso',
      icon: 'vpn_key',
      route: '/credentials',
      color: 'from-purple-500 to-purple-600',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      isActive: true
    },
    /*  {
       id: 'menu-management',
       title: 'Gestione Menu',
       description: 'Configura la struttura di navigazione e i menu dell\'applicazione',
       icon: 'menu',
       route: '/menu',
       color: 'from-orange-500 to-orange-600',
       gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
       isActive: true
     }, */
    /* {
      id: 'weblink-list',
      title: 'Lista Web Links',
      description: 'Vista tabellare completa di tutti i web links con filtri avanzati',
      icon: 'list',
      route: '/weblink-list',
      color: 'from-cyan-500 to-cyan-600',
      gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      isActive: true
    }, */
    /* {
      id: 'note-list',
      title: 'Lista Note',
      description: 'Vista tabellare completa di tutte le note tecniche con ricerca',
      icon: 'list_alt',
      route: '/note-list',
      color: 'from-teal-500 to-teal-600',
      gradient: 'bg-gradient-to-br from-teal-500 to-teal-600',
      isActive: true
    }, */
    /* {
      id: 'config',
      title: 'Configurazione',
      description: 'Impostazioni dell\'applicazione e configurazione degli ambienti',
      icon: 'settings',
      route: '/config',
      color: 'from-gray-500 to-gray-600',
      gradient: 'bg-gradient-to-br from-gray-500 to-gray-600',
      isActive: true
    } */
  ];

  ngOnInit(): void {
    this.loadModuleStatistics();
  }

  private async loadModuleStatistics(): Promise<void> {
    this.loading = true;

    try {
      // Carica le statistiche in parallelo
      const [webLinksStats, notesStats] = await Promise.all([
        this.loadWebLinksStats(),
        this.loadNotesStats()
      ]);

      // Combina le statistiche con la configurazione base
      this.moduleCards = this.baseModules.map(module => {
        let count = 0;
        let lastUsed: Date | undefined;

        switch (module['id']) {
          case 'weblinks':
            count = webLinksStats.totalCount;
            lastUsed = webLinksStats.lastUsed;
            break;
          case 'notes':
            count = notesStats.totalCount;
            lastUsed = notesStats.lastUsed;
            break;
          /* case 'weblink-list':
            count = webLinksStats.totalCount;
            lastUsed = webLinksStats.lastUsed;
            break;
          case 'note-list':
            count = notesStats.totalCount;
            lastUsed = notesStats.lastUsed;
            break; */
          default:
            count = Math.floor(Math.random() * 50); // Dato temporaneo per altri moduli
        }

        return {
          ...module,
          count,
          lastUsed
        };
      });

      // Ordina per count decrescente
      this.moduleCards.sort((a, b) => b.count - a.count);

    } catch (error) {
      console.error('Errore nel caricamento delle statistiche:', error);
      // In caso di errore, usa i dati base senza statistiche
      this.moduleCards = this.baseModules.map(module => ({
        ...module,
        count: 0
      }));
    } finally {
      this.loading = false;
    }
  }

  private async loadWebLinksStats(): Promise<{ totalCount: number, lastUsed?: Date }> {
    try {
      const [allLinks, recentLinks] = await Promise.all([
        this.webLinksService.getAll().toPromise(),
        this.webLinksService.getRecent(1).toPromise()
      ]);

      return {
        totalCount: allLinks?.length || 0,
        lastUsed: recentLinks?.[0]?.lastUsed ? new Date(recentLinks[0].lastUsed) : undefined
      };
    } catch (error) {
      console.error('Errore nel caricamento statistiche WebLinks:', error);
      return { totalCount: 0 };
    }
  }

  private async loadNotesStats(): Promise<{ totalCount: number, lastUsed?: Date }> {
    try {
      const [allNotes, recentNotes] = await Promise.all([
        this.notesService.getAll().toPromise(),
        this.notesService.getRecent(1).toPromise()
      ]);

      return {
        totalCount: allNotes?.length || 0,
        lastUsed: recentNotes?.[0]?.lastUsed ? new Date(recentNotes[0].lastUsed) : undefined
      };
    } catch (error) {
      console.error('Errore nel caricamento statistiche Notes:', error);
      return { totalCount: 0 };
    }
  }

  navigateToModule(card: Card): void {
    if (card.isActive) {
      this.router.navigate([card.route]);
    }
  }

  formatLastUsed(date?: Date): string {
    if (!date) return 'Mai utilizzato';

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

  trackByCard(index: number, card: Card): string {
    return card.id;
  }

  getTotalItems(): number {
    return this.moduleCards.reduce((total, card) => total + card.count, 0);
  }

  getActiveModules(): number {
    return this.moduleCards.filter(card => card.isActive && card.count > 0).length;
  }

  getCurrentTime(): Date {
    return new Date();
  }

}