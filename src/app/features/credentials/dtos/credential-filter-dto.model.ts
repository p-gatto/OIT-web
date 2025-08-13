export interface CredentialFilterDto {
    searchTerm?: string;
    active?: boolean;
    expired?: boolean;
    pageIndex: number;
    pageSize: number;
    sortField: string;
    sortAscending: boolean;
}