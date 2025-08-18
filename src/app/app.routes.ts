import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'config',
        loadComponent: () => import('./core/config/config.component')
    },
    {
        path: 'menu',
        loadComponent: () => import('./core/management/menu/menu.component')
    },
    {
        path: 'credentials',
        loadComponent: () => import('./features/credentials/credentials.component')
    },
    {
        path: 'weblinks',
        loadComponent: () => import('./features/weblinks/weblinks.component')
    },
    {
        path: 'weblink-list',
        loadComponent: () => import('./features/weblinks/weblink-list/weblink-list.component')
    },
    {
        path: 'notes',
        loadComponent: () => import('./features/notes/notes.component')
    },
    {
        path: 'note-list',
        loadComponent: () => import('./features/notes/note-list/note-list.component')
    },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    {
        path: 'home',
        loadComponent: () => import('./features/home/home.component')
    },
    { path: '**', redirectTo: '/home' }
];
