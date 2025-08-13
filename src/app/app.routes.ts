import { Routes } from '@angular/router';

import { ConfigComponent } from './core/config/config.component';
import { HomeComponent } from './features/home/home.component';
import { CredentialsComponent } from './features/credentials/credentials.component';
import { MenuComponent } from './core/management/menu/menu.component';

export const routes: Routes = [
    { path: 'config', component: ConfigComponent },
    { path: 'menu', component: MenuComponent },
    { path: 'credentials', component: CredentialsComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: '**', redirectTo: '/home' }
];
