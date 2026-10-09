import { GeneralUser } from '@app/gateways/repositories/users';
import { userHeadersAndVerboseNames } from '@app/site/pages/organization/pages/accounts/pages/account-import/definitions';

export const participantHeadersAndVerboseNames: { [key in keyof GeneralUser]?: any } = {
    ...userHeadersAndVerboseNames,
    structure_level: `Structure levels`,
    groups: `Groups`,
    number: `Participant number`,
    vote_weight: `Vote weight`,
    is_present: `Is present`,
    locked_out: `Locked out`,
    comment: `Comment`
};

export const participantColumns: (keyof GeneralUser)[] = [
    `title`,
    `first_name`,
    `last_name`,
    `email`,
    `member_number`,
    `structure_level`,
    `groups`,
    `number`,
    `vote_weight`,
    `gender`,
    `pronoun`,
    `username`,
    `default_password`,
    `is_active`,
    `is_physical_person`,
    `is_present`,
    `locked_out`,
    `saml_id`,
    `home_committee`,
    `external`,
    `comment`
];

type ExcludedGeneralUserKey = Exclude<keyof GeneralUser, keyof typeof Object.prototype>;

export const participantColumnsDescriptions: Partial<Record<ExcludedGeneralUserKey, string>> = {
    title: '',
    first_name: 'first name, last name, or username must be provided',
    last_name: 'first name, last name, or username must be provided',
    email: 'valid email format required',
    member_number: 'must be unique',
    structure_level: 'example "A, B, C". New elements are created automatically during import.',
    groups: 'example "Admin, Delegates". New elements are created automatically during import. ',
    number: '',
    vote_weight: 'enter a voting weight greater than 0',
    gender: 'only existing genders can be used. Default values: male, female, divers, non-binary',
    pronoun: '',
    username: 'automatically generated from first and last name; must be unique. ',
    default_password: 'automatically generated',
    is_active: '0 or 1',
    is_physical_person: '0 or 1',
    is_present: '0 or 1',
    locked_out: '0 or 1',
    saml_id: 'if used, this value must be unique',
    home_committee: '',
    external: '0 or 1',
    comment: ''
};
