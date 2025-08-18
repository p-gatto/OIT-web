import { Component, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ConfigService } from './config.service';

@Component({
  selector: 'app-config',
  imports: [
    NgIf
  ],
  templateUrl: './config.component.html',
  styles: ``
})
export default class ConfigComponent {

  private configService = inject(ConfigService);

  // Utilizzo di signals per la reattività
  loaded = signal(false);
  appName = signal('');
  managementsApiBaseUrl = signal('');
  credentialsApiBaseUrl = signal('');
  reportsApiBaseUrl = signal('');
  weblinksApiBaseUrl = signal('');

  constructor() {
    // Sottoscrizione ai cambiamenti della configurazione
    this.configService.config$.pipe(
      takeUntilDestroyed()
    ).subscribe(config => {
      if (config) {
        this.loaded.set(true);
        this.appName.set(config.appName);
        this.managementsApiBaseUrl.set(config.managementsApiBaseUrl);
        this.credentialsApiBaseUrl.set(config.credentialsApiBaseUrl);
        this.reportsApiBaseUrl.set(config.reportsApiBaseUrl);
        this.weblinksApiBaseUrl.set(config.weblinksApiBaseUrl);
      }
    });
  }

  ngOnInit() {
    // Se la configurazione è già caricata
    const config = this.configService.getConfig();
    if (config) {
      this.loaded.set(true);
      this.appName.set(config.appName);
      this.managementsApiBaseUrl.set(config.managementsApiBaseUrl);
      this.credentialsApiBaseUrl.set(config.credentialsApiBaseUrl);
      this.reportsApiBaseUrl.set(config.reportsApiBaseUrl);
      this.weblinksApiBaseUrl.set(config.weblinksApiBaseUrl);
    }
  }

}