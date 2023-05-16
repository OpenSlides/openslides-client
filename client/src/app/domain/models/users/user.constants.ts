import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

import { User } from './user';

export const userHeadersAndVerboseNames: { [key in keyof User]?: any } = {
    title: _(`Title`),
    tech_id: _(`Technische ID`),
    member_id: _(`Mitgliedsnummer`),
    first_name: _(`Given name`),
    last_name: _(`Surname`),
    email: _(`Email`),
    pronoun: _(`Pronoun`),
    gender: _(`Gender`),
    username: _(`Username`),
    default_password: _(`Initial password`),
    is_active: _(`Active`),
    is_physical_person: _(`Natural person`)
};
