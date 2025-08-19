export interface Card {
    id: string;
    title: string;
    description: string;
    icon: string;
    route: string;
    count: number;
    lastUsed?: Date;
    color: string;
    gradient: string;
    isActive: boolean;
}