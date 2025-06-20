import { _ } from '@ngx-translate/core';
import { userHeadersAndVerboseNames, ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

export const accountHeadersAndVerboseNames: Partial<Record<keyof ViewUser, any>> = {
    ...userHeadersAndVerboseNames,
    default_vote_weight: _(`Vote weight`)
};

export const accountColumns: (keyof ViewUser)[] = [
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
