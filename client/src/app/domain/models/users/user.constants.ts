import { _ } from '@ngx-translate/core';

import { User } from './user';

export const userHeadersAndVerboseNames: Partial<Record<keyof User | `gender` | `home_committee`, any>> = {
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
    guest: _(`External`)
};
