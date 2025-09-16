import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ConfigService } from '../../core/config/config.service';

import { PaginatedResult } from './dtos/paginated-result.model';
import { CredentialFilterDto } from './dtos/credential-filter-dto.model';
import { CredentialCreateDto } from './dtos/credential-create-dto.model';
import { CredentialUpdateDto } from './dtos/credential-update-dto.model';

import { Credential as CredentialOIT } from '../credentials/models/credential.model';
import { CredentialStats } from './models/credential-stats.model';

@Injectable({
  providedIn: 'root'
})
export class CredentialsService {

  http = inject(HttpClient);
  configService = inject(ConfigService);

  apiUrl = signal('https://localhost');

  constructor() {
    // Se la configurazione è già caricata
    const config = this.configService.getConfig();
    if (config) {
      this.apiUrl.set(`${config.credentialsApiBaseUrl}/api/credentials`);
    }
  }

  // NUOVI METODI PER LE STATISTICHE

  /**
   * Ottiene le credenziali più utilizzate
   */
  getMostUsed(count: number = 10): Observable<CredentialOIT[]> {
    return this.http.get<CredentialOIT[]>(`${this.apiUrl()}/most-used?count=${count}`);
  }

  /**
   * Ottiene le credenziali utilizzate più di recente
   */
  getRecent(count: number = 10): Observable<CredentialOIT[]> {
    return this.http.get<CredentialOIT[]>(`${this.apiUrl()}/recent?count=${count}`);
  }

  /**
   * Incrementa il contatore di utilizzo di una credenziale
   */
  incrementUsage(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl()}/${id}/increment-usage`, {});
  }

  /**
   * Ottiene le statistiche generali delle credenziali
   */
  getStats(): Observable<CredentialStats> {
    return this.http.get<CredentialStats>(`${this.apiUrl()}/stats`);
  }

  // METODI ESISTENTI (invariati)

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