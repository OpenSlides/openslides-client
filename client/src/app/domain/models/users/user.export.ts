export interface UserExport {
    title?: string;
    first_name?: string;
    last_name?: string;
    is_active?: string | boolean;
    is_physical_person?: string | boolean;
    default_password?: string;
    email?: string;
    username?: string;
    gender?: string;
    default_number?: string | number;
    default_vote_weight?: string | number;
    pronoun?: string;
}
