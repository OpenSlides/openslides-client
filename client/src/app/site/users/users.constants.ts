import { User } from 'app/shared/models/users/user';

/**
 * Helper for mapping the expected header in a typesafe way. Values and order
 * will be passed to {@link expectedHeader}
 */
export const headerMap: (keyof User)[] = [
    'title',
    'first_name',
    'last_name',
    'comment',
    'is_active',
    'is_physical_person',
    'is_present_in_meeting_ids',
    'default_password',
    'email',
    'username',
    'gender',
    'default_number',
    'default_structure_level',
    'default_vote_weight',
    'group_ids'
];

export const userHeadersAndVerboseNames: { [key: string]: string } = {
    title: 'Title',
    first_name: 'Given name',
    last_name: 'Surname',
    comment: 'Comment',
    is_active: 'Is active',
    is_physical_person: 'Is a physical person',
    is_present_in_meeting_ids: 'Is present',
    default_password: 'Initial password',
    email: 'Email',
    username: 'Username',
    gender: 'Gender',
    default_number: 'Participant number',
    default_structure_level: 'Structure level',
    default_vote_weight: 'Vote weight',
    group_ids: 'Groups'
};
