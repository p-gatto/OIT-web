export interface CredentialStats {
    totalCredentials: number;
    usedCredentials: number;
    expiredCredentials: number;
    totalUsage: number;
    mostUsedCredential?: string;
    mostUsedCredentialUsageCount: number;
    lastUsedCredential?: string;
    lastUsedDate?: Date;
}