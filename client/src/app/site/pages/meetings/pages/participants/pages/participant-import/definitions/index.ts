import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { GeneralUser } from 'src/app/gateways/repositories/users';

export const participantHeadersAndVerboseNames: { [key in keyof GeneralUser]?: any } = {
    title: _(`Title`),
    first_name: _(`Given name`),
    last_name: _(`Surname`),
    email: _(`Email`),
    member_number: _(`Member number`),
    structure_level: `Structure levels`,
    groups: `Groups`,
    number: `Participant number`,
    vote_weight: `Vote weight`,
    gender: _(`Gender`),
    pronoun: _(`Pronoun`),
    username: _(`Username`),
    default_password: _(`Initial password`),
    is_active: _(`Active`),
    is_physical_person: _(`Natural person`),
    is_present: `Is present`,
    saml_id: _(`SSO identification`),
    comment: `Comment`
};
