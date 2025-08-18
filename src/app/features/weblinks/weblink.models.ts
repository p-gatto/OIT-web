export interface WebLink {
    id: number;
    url: string;
    title: string;
    description?: string;
    area: string;
    category: string;
    subCategory: string;
    usageCount: number;
    isFavorite: boolean;
    lastUsed: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateWebLink {
    url: string;
    title: string;
    description?: string;
    area: string;
    category: string;
    subCategory: string;
    isFavorite?: boolean;
}

export interface UpdateWebLink {
    url: string;
    title: string;
    description?: string;
    area: string;
    category: string;
    subCategory: string;
    isFavorite: boolean;
}

export interface LinksSummary {
    mostUsed?: WebLink[];
    favorites?: WebLink[];
    recentlyUsed?: WebLink[];
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