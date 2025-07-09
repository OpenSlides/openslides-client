import { _ } from '@ngx-translate/core';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

export const userHeadersAndVerboseNames: Partial<Record<keyof ViewUser, any>> = {
    title: _(`Title`),
    first_name: _(`Given name`),
    last_name: _(`Surname`),
    email: _(`Email`),
    member_number: _(`Membership number`),
    pronoun: _(`Pronoun`),
    gender: _(`Gender`),
    username: _(`Username`),
    default_password: _(`Initial password`),
    is_active: _(`Active`),
    is_physical_person: _(`Natural person`),
    saml_id: _(`SSO identification`),
    home_committee: _(`Home committee`),
    external: _(`External`)
};

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
    `external`
];
