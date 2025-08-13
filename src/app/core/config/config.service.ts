// 1. Creiamo il servizio per caricare la configurazione (approach moderno Angular 19)
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, lastValueFrom } from 'rxjs';

import { AppConfig } from './config.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {

    private http = inject(HttpClient);
    private configPath = './assets/config/config.development.json';

    private config = new BehaviorSubject<AppConfig | null>(null);
    public config$ = this.config.asObservable();

    constructor() {
        if (environment.staging == true) {
            this.configPath = '/assets/config/config.staging.json';
        }

        if (environment.hub == true) {
            this.configPath = '/assets/config/config.hub.json';
        }

        if (environment.production == true) {
            this.configPath = '/assets/config/config.production.json';
        }
    }

    // Metodo per caricare la configurazione
    async loadConfig(): Promise<AppConfig> {
        const config = await lastValueFrom(
            this.http.get<AppConfig>(this.configPath)
            //this.http.get<AppConfig>('./assets/config/config.json')
        );
        this.config.next(config);
        return config;
    }

    // Metodo per accedere alla configurazione
    getConfig(): AppConfig | null {
        return this.config.getValue();
    }
}
