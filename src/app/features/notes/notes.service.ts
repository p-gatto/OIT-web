import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ConfigService } from '../../core/config/config.service';

import { Note, CreateNote, UpdateNote, NotesSummary } from './note.models';

@Injectable({
  providedIn: 'root'
})
export class NotesService {

  http = inject(HttpClient);
  configService = inject(ConfigService);

  apiUrl = signal('https://localhost');

  constructor() {
    // Se la configurazione è già caricata
    const config = this.configService.getConfig();
    console.log('Get config (Notes): ', config);
    if (config) {
      // Assumendo che aggiungerai notesApiBaseUrl alla configurazione
      this.apiUrl.set(`${config.notesApiBaseUrl}/api/notes`);
      console.log('Get apiUrl (Notes): ', this.apiUrl());
    }
  }

  // Summary endpoints
  getSummary(): Observable<NotesSummary> {
    return this.http.get<NotesSummary>(`${this.apiUrl()}/summary`);
  }

  getMostUsed(count: number = 10): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl()}/most-used?count=${count}`);
  }

  getFavorites(count: number = 10): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl()}/favorites?count=${count}`);
  }

  getRecent(count: number = 10): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl()}/recent?count=${count}`);
  }

  getRecentlyUpdated(count: number = 10): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl()}/recently-updated?count=${count}`);
  }

  // CRUD operations
  getAll(): Observable<Note[]> {
    return this.http.get<Note[]>(this.apiUrl());
  }

  getById(id: number): Observable<Note> {
    return this.http.get<Note>(`${this.apiUrl()}/${id}`);
  }

  create(note: CreateNote): Observable<Note> {
    return this.http.post<Note>(this.apiUrl(), note);
  }

  update(id: number, note: UpdateNote): Observable<Note> {
    return this.http.put<Note>(`${this.apiUrl()}/${id}`, note);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl()}/${id}`);
  }

  // Filter endpoints
  getByArea(area: string): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl()}/by-area/${encodeURIComponent(area)}`);
  }

  getByCategory(category: string): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl()}/by-category/${encodeURIComponent(category)}`);
  }

  getBySubCategory(subCategory: string): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl()}/by-subcategory/${encodeURIComponent(subCategory)}`);
  }

  getByType(type: string): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl()}/by-type/${encodeURIComponent(type)}`);
  }

  // Search endpoints
  searchByName(searchTerm: string): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl()}/search/name?searchTerm=${encodeURIComponent(searchTerm)}`);
  }

  searchByContent(searchTerm: string): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl()}/search/content?searchTerm=${encodeURIComponent(searchTerm)}`);
  }

  // Utility
  incrementUsage(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl()}/${id}/increment-usage`, {});
  }
}