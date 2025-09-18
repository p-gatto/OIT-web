export interface ItemCard {
    id: number;
    name: string;
    title?: string; // per weblinks
    description?: string;
    category?: string;
    subCategory?: string;
    area?: string;
    type?: string; // per note
    usageCount: number;
    lastUsed?: Date;
    username?: string; // per credentials
    password?: string;
    url?: string; // per weblinks
    freeText?: string; // per note
    isFavorite?: boolean;
}
