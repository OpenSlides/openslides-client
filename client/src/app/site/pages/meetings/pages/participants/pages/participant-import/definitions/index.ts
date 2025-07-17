import { GeneralUser } from 'src/app/gateways/repositories/users';
import { userHeadersAndVerboseNames } from 'src/app/site/pages/organization/pages/accounts/pages/account-import/definitions';

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
