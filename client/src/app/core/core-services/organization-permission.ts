export enum CML {
    can_manage = 'can_manage',
    default = 'default'
}

export enum OML {
    superadmin = 'superadmin',
    can_manage_organisation = 'can_manage_organisation',
    can_manage_users = 'can_manage_users',
    default = 'default'
}

export const omlNameMapping = {
    superadmin: 3,
    can_manage_organisation: 2,
    can_manage_users: 1,
    default: 0
};

export const cmlNameMapping = {
    can_manage: 1,
    default: 0
};
