import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { WebLink } from './weblink.models';
import { WebLinksService } from './weblinks.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-weblinks',
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './weblinks.component.html',
  styleUrl: './weblinks.component.css'
})
export default class WeblinksComponent {

  webLinksService = inject(WebLinksService);
  route = inject(ActivatedRoute);

  loading = true;
  selectedTabIndex = 0;

  mostUsedLinks: WebLink[] = [];
  favoriteLinks: WebLink[] = [];
  recentLinks: WebLink[] = [];

  constructor() { }

  ngOnInit(): void {
    // Check for query params to set initial tab
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        switch (params['tab']) {
          case 'most-used':
            this.selectedTabIndex = 0;
            break;
          case 'favorites':
            this.selectedTabIndex = 1;
            break;
          case 'recent':
            this.selectedTabIndex = 2;
            break;
        }
      }
    });

    this.loadData();
  }

  loadData(): void {
    // Load all data in parallel
    Promise.all([
      this.webLinksService.getMostUsed(10).toPromise(),
      this.webLinksService.getFavorites(10).toPromise(),
      this.webLinksService.getRecent(10).toPromise()
    ]).then(([mostUsed, favorites, recent]) => {
      this.mostUsedLinks = mostUsed || [];
      this.favoriteLinks = favorites || [];
      this.recentLinks = recent || [];
      this.loading = false;
    }).catch(error => {
      console.error('Error loading weblinks data:', error);
      this.loading = false;
    });
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
  }

  openLink(link: WebLink, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    // Increment usage count
    this.webLinksService.incrementUsage(link.id).subscribe({
      next: () => {
        // Optionally refresh the current tab data
        this.refreshCurrentTab();
      },
      error: (error) => {
        console.error('Error incrementing usage:', error);
      }
    });

    // Open link in new tab
    window.open(link.url, '_blank');
  }

  refreshCurrentTab(): void {
    switch (this.selectedTabIndex) {
      case 0:
        this.webLinksService.getMostUsed(10).subscribe(links => {
          this.mostUsedLinks = links;
        });
        break;
      case 1:
        this.webLinksService.getFavorites(10).subscribe(links => {
          this.favoriteLinks = links;
        });
        break;
      case 2:
        this.webLinksService.getRecent(10).subscribe(links => {
          this.recentLinks = links;
        });
        break;
    }
  }

  trackByLink(index: number, link: WebLink): number {
    return link.id;
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