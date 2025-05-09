import { _ } from '@ngx-translate/core';
import { User } from 'src/app/domain/models/users/user';
import { userHeadersAndVerboseNames } from 'src/app/domain/models/users/user.constants';

export const accountHeadersAndVerboseNames: Partial<Record<keyof User | `gender` | `home_committee`, any>> = {
    ...userHeadersAndVerboseNames,
    default_vote_weight: _(`Vote weight`)
};

export const accountColumns: (keyof User | `gender` | `home_committee`)[] = [
    `title`,
    `first_name`,
    `last_name`,
    `email`,
    `member_number`,
    `default_vote_weight`,
    `gender`,
    `pronoun`,
    `username`,
    `default_password`,
    `is_active`,
    `is_physical_person`,
    `saml_id`,
    `home_committee`,
    `guest`
];
