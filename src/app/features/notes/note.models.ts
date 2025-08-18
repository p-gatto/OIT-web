export interface Note {
    id: number;
    name: string;
    description?: string;
    area: string;
    category: string;
    subCategory: string;
    type: string; // "comando", "procedura", "informazione generica", "nota tecnica"
    freeText?: string;
    usageCount: number;
    isFavorite: boolean;
    lastUsed: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateNote {
    name: string;
    description?: string;
    area: string;
    category: string;
    subCategory: string;
    type: string;
    freeText?: string;
    isFavorite?: boolean;
}

export interface UpdateNote {
    name: string;
    description?: string;
    area: string;
    category: string;
    subCategory: string;
    type: string;
    freeText?: string;
    isFavorite: boolean;
}

export interface NotesSummary {
    mostUsed?: Note[];
    favorites?: Note[];
    recentlyUsed?: Note[];
}

export interface DashboardCard {
    title: string;
    subtitle: string;
    icon: string;
    count: number;
    route: string;
    color: string;
    description: string;
}