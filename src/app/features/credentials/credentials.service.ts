import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ConfigService } from '../../core/config/config.service';

import { PaginatedResult } from './dtos/paginated-result.model';
import { CredentialFilterDto } from './dtos/credential-filter-dto.model';
import { CredentialCreateDto } from './dtos/credential-create-dto.model';
import { CredentialUpdateDto } from './dtos/credential-update-dto.model';

import { Credential as CredentialOIT } from '../credentials/models/credential.model';

@Injectable({
  providedIn: 'root'
})
export class CredentialsService {

  http = inject(HttpClient);
  configService = inject(ConfigService);

  apiUrl = signal('https://localhost');

  //private apiUrl = `${this.configService.config$}/api/credentials`;

  constructor() {
    // Se la configurazione è già caricata
    const config = this.configService.getConfig();
    //console.log('Get config: ', config);
    if (config) {
      this.apiUrl.set(`${config.credentialsApiBaseUrl}/api/credentials`);
      //console.log('Get apiUrl: ', this.apiUrl());
    }
  }

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