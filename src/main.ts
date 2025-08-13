import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { ConfigService } from './app/core/config/config.service';

// Bootstrap di default
/* bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err)); */

// Bootstrap con precaricamento configurazione
async function bootstrap() {
  const app = await bootstrapApplication(AppComponent, appConfig);
  const configService = app.injector.get(ConfigService);
  await configService.loadConfig();
  return app;
}

bootstrap().catch(err => console.error(err));