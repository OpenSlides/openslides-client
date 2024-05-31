import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { User } from 'src/app/domain/models/users/user';

export const accountHeadersAndVerboseNames: { [key in keyof User]?: any } = {
    title: _(`Title`),
    first_name: _(`Given name`),
    last_name: _(`Surname`),
    email: _(`Email`),
    member_number: _(`Member number`),
    default_vote_weight: _(`Vote weight`),
    pronoun: _(`Pronoun`),
    gender: _(`Gender`),
    username: _(`Username`),
    default_password: _(`Initial password`),
    is_active: _(`Active`),
    is_physical_person: _(`Natural person`),
    saml_id: _(`SSO identification`)
};
