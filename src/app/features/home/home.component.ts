import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardCard, LinksSummary } from '../weblinks/weblink.models';
import { WebLinksService } from '../weblinks/weblinks.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    NgIf,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export default class HomeComponent {

  hasRoutes = false;

  loading = true;
  summary: LinksSummary | null = null;
  dashboardCards: DashboardCard[] = [];

  constructor(
    private webLinksService: WebLinksService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.webLinksService.getSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
        this.setupDashboardCards(summary);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
        // Setup default cards even on error
        this.setupDefaultCards();
      }
    });
  }

  setupDashboardCards(summary: LinksSummary): void {
    this.dashboardCards = [
      {
        title: 'Web Links',
        subtitle: 'Gestione completa',
        icon: 'link',
        count: this.getTotalLinksCount(summary),
        route: '/weblinks',
        color: 'border-blue-500',
        description: 'Visualizza e gestisci tutti i tuoi link web'
      },
      {
        title: 'Più Utilizzati',
        subtitle: 'Top performers',
        icon: 'trending_up',
        count: 0,
        route: '/weblinks?tab=most-used',
        color: 'border-green-500',
        description: 'I link con il maggior numero di accessi'
      },
      {
        title: 'Preferiti',
        subtitle: 'I tuoi favoriti',
        icon: 'favorite',
        count: 0,
        route: '/weblinks?tab=favorites',
        color: 'border-red-500',
        description: 'Accesso rapido ai link preferiti'
      },
      {
        title: 'Recenti',
        subtitle: 'Attività recente',
        icon: 'schedule',
        count: 0,
        route: '/weblinks?tab=recent',
        color: 'border-purple-500',
        description: 'Gli ultimi link che hai visitato'
      }
    ];
  }

  getTotalLinksCount(summary: LinksSummary): number {
    const mostUsedCount = summary.mostUsed?.length || 0;
    const favoritesCount = summary.favorites?.length || 0;
    const recentCount = summary.recentlyUsed?.length || 0;
    return Math.max(mostUsedCount, favoritesCount, recentCount);
  }

  navigateToCard(card: DashboardCard): void {
    this.router.navigate([card.route.split('?')[0]], {
      queryParams: this.parseQueryParams(card.route)
    });
  }

  parseQueryParams(route: string): any {
    const [, queryString] = route.split('?');
    if (!queryString) return {};

    const params: any = {};
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      params[key] = value;
    });
    return params;
  }

  trackByCard(index: number, card: DashboardCard): string {
    return card.title;
  }

  getIconColor(borderColor: string): string {
    const colorMap: { [key: string]: string } = {
      'border-blue-500': 'text-blue-200',
      'border-green-500': 'text-green-200',
      'border-red-500': 'text-red-200',
      'border-purple-500': 'text-purple-200'
    };
    return colorMap[borderColor] || 'text-gray-200';
  }

  getTextColor(borderColor: string): string {
    const colorMap: { [key: string]: string } = {
      'border-blue-500': 'text-blue-600',
      'border-green-500': 'text-green-600',
      'border-red-500': 'text-red-600',
      'border-purple-500': 'text-purple-600'
    };
    return colorMap[borderColor] || 'text-gray-600';
  }

  formatDate(dateString: Date): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Oggi';
    if (diffDays === 2) return 'Ieri';
    if (diffDays <= 7) return `${diffDays} giorni fa`;

    return date.toLocaleDateString('it-IT');
  }

  setupDefaultCards(): void {
    this.dashboardCards = [
      {
        title: 'Web Links',
        subtitle: 'Gestione completa',
        icon: 'link',
        count: 0,
        route: '/weblinks',
        color: 'border-blue-500',
        description: 'Visualizza e gestisci tutti i tuoi link web'
      },
      {
        title: 'Più Utilizzati',
        subtitle: 'Top performers',
        icon: 'trending_up',
        count: this.summary!.mostUsed?.length || 0,
        route: '/weblinks?tab=most-used',
        color: 'border-green-500',
        description: 'I link con il maggior numero di accessi'
      },
      {
        title: 'Preferiti',
        subtitle: 'I tuoi favoriti',
        icon: 'favorite',
        count: this.summary!.favorites?.length || 0,
        route: '/weblinks?tab=favorites',
        color: 'border-red-500',
        description: 'Accesso rapido ai link preferiti'
      },
      {
        title: 'Recenti',
        subtitle: 'Attività recente',
        icon: 'schedule',
        count: this.summary!.recentlyUsed?.length || 0,
        route: '/weblinks?tab=recent',
        color: 'border-purple-500',
        description: 'Gli ultimi link che hai visitato'
      }
    ];
  }

}