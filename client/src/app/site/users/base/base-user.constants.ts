import { User } from '../../../shared/models/users/user';

export const BaseUserHeaders: (keyof User)[] = [
    'title',
    'first_name',
    'last_name',
    'is_active',
    'is_physical_person',
    'default_password',
    'email',
    'username',
    'gender',
    'default_number',
    'default_structure_level',
    'default_vote_weight'
];

export const BaseUserHeadersAndVerboseNames: { [key: string]: string } = {
    title: 'Title',
    first_name: 'Given name',
    last_name: 'Surname',
    is_active: 'Active',
    is_physical_person: 'Natural person',
    default_password: 'Initial password',
    email: 'Email',
    username: 'Username',
    gender: 'Gender',
    default_number: 'Participant number',
    default_structure_level: 'Structure level',
    default_vote_weight: 'Vote weight'
};
