export interface OMLMapping {
    superadmin: number;
    can_manage_organization: number;
    can_manage_users: number;
}

export interface CMLMapping {
    can_manage: number;
}

export enum CML {
    can_manage = `can_manage`
}

export enum OML {
    superadmin = `superadmin`,
    can_manage_organization = `can_manage_organization`,
    can_manage_users = `can_manage_users`
}

export const omlNameMapping: { [permission: string]: number } = {
    superadmin: 3,
    can_manage_organization: 2,
    can_manage_users: 1
};

export const cmlNameMapping: { [permission: string]: number } = {
    can_manage: 1
};

export const cmlVerbose = {
    can_manage: `Can manage`
};

export const omlVerbose = {
    superadmin: `Superadmin`,
    can_manage_organization: `Organization admin`,
    can_manage_users: `Account admin`
};

export function getOmlVerboseName(omlKey: keyof OMLMapping): string {
    return omlVerbose[omlKey];
}

export function getCmlVerboseName(cmlKey: keyof CMLMapping): string {
    return cmlVerbose[cmlKey];
}
