import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ConfigService } from '../../core/config/config.service';

import { WebLink, CreateWebLink, UpdateWebLink, LinksSummary } from './weblink.models';

@Injectable({
  providedIn: 'root'
})
export class WebLinksService {

  http = inject(HttpClient);
  configService = inject(ConfigService);

  apiUrl = signal('https://localhost');

  constructor() {
    // Se la configurazione è già caricata
    const config = this.configService.getConfig();
    console.log('Get config (Weblinks): ', config);
    if (config) {
      this.apiUrl.set(`${config.weblinksApiBaseUrl}/api/weblinks`);
      console.log('Get apiUrl (Weblinks): ', this.apiUrl());
    }
  }

  // Summary endpoints
  getSummary(): Observable<LinksSummary> {
    return this.http.get<LinksSummary>(`${this.apiUrl()}/summary`);
  }

  getMostUsed(count: number = 10): Observable<WebLink[]> {
    return this.http.get<WebLink[]>(`${this.apiUrl()}/most-used?count=${count}`);
  }

  getFavorites(count: number = 10): Observable<WebLink[]> {
    return this.http.get<WebLink[]>(`${this.apiUrl()}/favorites?count=${count}`);
  }

  getRecent(count: number = 10): Observable<WebLink[]> {
    return this.http.get<WebLink[]>(`${this.apiUrl()}/recent?count=${count}`);
  }

  getRecentlyUpdated(count: number = 10): Observable<WebLink[]> {
    return this.http.get<WebLink[]>(`${this.apiUrl()}/recently-updated?count=${count}`);
  }

  // CRUD operations
  getAll(): Observable<WebLink[]> {
    return this.http.get<WebLink[]>(this.apiUrl());
  }

  getById(id: number): Observable<WebLink> {
    return this.http.get<WebLink>(`${this.apiUrl()}/${id}`);
  }

  create(webLink: CreateWebLink): Observable<WebLink> {
    return this.http.post<WebLink>(this.apiUrl(), webLink);
  }

  update(id: number, webLink: UpdateWebLink): Observable<WebLink> {
    return this.http.put<WebLink>(`${this.apiUrl()}/${id}`, webLink);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl()}/${id}`);
  }

  // Filter endpoints
  getByArea(area: string): Observable<WebLink[]> {
    return this.http.get<WebLink[]>(`${this.apiUrl()}/by-area/${encodeURIComponent(area)}`);
  }

  getByCategory(category: string): Observable<WebLink[]> {
    return this.http.get<WebLink[]>(`${this.apiUrl()}/by-category/${encodeURIComponent(category)}`);
  }

  getBySubCategory(subCategory: string): Observable<WebLink[]> {
    return this.http.get<WebLink[]>(`${this.apiUrl()}/by-subcategory/${encodeURIComponent(subCategory)}`);
  }

  // Utility
  incrementUsage(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl()}/${id}/increment-usage`, {});
  }
}