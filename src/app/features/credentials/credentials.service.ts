import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, tap } from 'rxjs';

import { ConfigService } from '../../core/config/config.service';

import { PaginatedResult } from './dtos/paginated-result.model';
import { CredentialFilterDto } from './dtos/credential-filter-dto.model';
import { CredentialCreateDto } from './dtos/credential-create-dto.model';
import { CredentialUpdateDto } from './dtos/credential-update-dto.model';

import { Credential as CredentialOIT } from '../credentials/models/credential.model';
import { CredentialStats } from './models/credential-stats.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class CredentialsService {

  http = inject(HttpClient);
  configService = inject(ConfigService);

  apiUrl = signal('https://localhost');

  constructor() {
    // Sottoscrizione ai cambiamenti della configurazione
    this.configService.config$.pipe(
      takeUntilDestroyed()
    ).subscribe(config => {
      if (config) {
        this.apiUrl.set(`${config.credentialsApiBaseUrl}/api/credentials`);
        console.log('CredentialsService - API URL aggiornato:', this.apiUrl());
      }
    });

    // Se la configurazione è già caricata
    const config = this.configService.getConfig();
    if (config) {
      this.apiUrl.set(`${config.credentialsApiBaseUrl}/api/credentials`);
      console.log('CredentialsService - API URL inizializzato:', this.apiUrl());
    }
  }

  // METODI PER LE STATISTICHE

  /**
   * Ottiene le credenziali più utilizzate
   */
  getMostUsed(count: number = 10): Observable<CredentialOIT[]> {
    console.log(`Chiamata getMostUsed per ${count} elementi - URL: ${this.apiUrl()}/most-used`);
    return this.http.get<CredentialOIT[]>(`${this.apiUrl()}/most-used?count=${count}`).pipe(
      tap(result => console.log('getMostUsed - Ricevuti:', result.length, 'elementi'))
    );
  }

  /**
   * Ottiene le credenziali utilizzate più di recente
   */
  getRecent(count: number = 10): Observable<CredentialOIT[]> {
    console.log(`Chiamata getRecent per ${count} elementi - URL: ${this.apiUrl()}/recent`);
    return this.http.get<CredentialOIT[]>(`${this.apiUrl()}/recent?count=${count}`).pipe(
      tap(result => console.log('getRecent - Ricevuti:', result.length, 'elementi'))
    );
  }

  /**
   * Incrementa il contatore di utilizzo di una credenziale
   * QUESTO È IL METODO CRITICO CHE DEVE FUNZIONARE
   */
  incrementUsage(id: number): Observable<void> {
    const url = `${this.apiUrl()}/${id}/increment-usage`;
    console.log(`🔄 Incremento utilizzo credenziale ID: ${id} - URL: ${url}`);

    return this.http.post<void>(url, {}).pipe(
      tap({
        next: () => {
          console.log(`✅ Utilizzo incrementato con successo per credenziale ID: ${id}`);
        },
        error: (error) => {
          console.error(`❌ Errore nell'incremento utilizzo per credenziale ID: ${id}`, error);
          console.error('Dettagli errore:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            url: url
          });
        }
      })
    );
  }

  /**
   * Ottiene le statistiche generali delle credenziali
   */
  getStats(): Observable<CredentialStats> {
    return this.http.get<CredentialStats>(`${this.apiUrl()}/stats`);
  }

  // METODI ESISTENTI (CRUD)

  getAll(): Observable<CredentialOIT[]> {
    return this.http.get<CredentialOIT[]>(this.apiUrl() + '/all');
  }

  getCredentials(filter: CredentialFilterDto): Observable<PaginatedResult<CredentialOIT>> {

    let params = new HttpParams()
      .set('pageIndex', filter.pageIndex.toString())
      .set('pageSize', filter.pageSize.toString())
      .set('sortField', filter.sortField)
      .set('sortAscending', filter.sortAscending.toString());

    if (filter.searchTerm) {
      params = params.set('searchTerm', filter.searchTerm);
    }

    if (filter.active !== undefined) {
      params = params.set('active', filter.active.toString());
    }

    if (filter.expired !== undefined) {
      params = params.set('expired', filter.expired.toString());
    }

    return this.http.get<PaginatedResult<CredentialOIT>>(this.apiUrl(), { params });
  }

  getCredential(id: number): Observable<CredentialOIT> {
    return this.http.get<CredentialOIT>(`${this.apiUrl()}/${id}`);
  }

  createCredential(credential: CredentialCreateDto): Observable<CredentialOIT> {
    return this.http.post<CredentialOIT>(this.apiUrl(), credential);
  }

  updateCredential(id: number, credential: CredentialUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl()}/${id}`, credential);
  }

  deleteCredential(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl()}/${id}`);
  }

}