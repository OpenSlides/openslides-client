import { User } from './user';

export const userHeadersAndVerboseNames: { [key in keyof User]?: string } = {
    title: `Title`,
    first_name: `Given name`,
    last_name: `Surname`,
    is_active: `Active`,
    is_physical_person: `Natural person`,
    default_password: `Initial password`,
    email: `Email`,
    username: `Username`,
    gender: `Gender`
};

export const accountHeadersAndVerboseNames: { [key in keyof User]?: string } = {
    ...userHeadersAndVerboseNames,
    default_number: `Participant number`,
    default_structure_level: `Structure level`,
    default_vote_weight: `Vote weight`
};

export const participantHeadersAndVerboseNames: { [key in keyof User]?: string } = {
    ...userHeadersAndVerboseNames,
    number: `Participant number`,
    structure_level: `Structure level`,
    vote_weight: `Vote weight`,
    comment: `Comment`,
    is_present_in_meeting_ids: `Is present`,
    group_ids: `Groups`
};
