import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';

import { User } from './user';

export const userHeadersAndVerboseNames: { [key in keyof User]?: any } = {
    title: _(`Title`),
    first_name: _(`Given name`),
    last_name: _(`Surname`),
    email: _(`Email`),
    pronoun: _(`Pronoun`),
    gender: _(`Gender`),
    username: _(`Username`),
    default_password: _(`Initial password`),
    is_active: _(`Active`),
    is_physical_person: _(`Natural person`),
    saml_id: _(`SSO identification`)
};
