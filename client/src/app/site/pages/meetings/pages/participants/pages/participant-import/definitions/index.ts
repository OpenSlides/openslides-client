import { userHeadersAndVerboseNames } from 'src/app/domain/models/users/user.constants';
import { GeneralUser } from 'src/app/gateways/repositories/users';

export const participantHeadersAndVerboseNames: { [key in keyof GeneralUser]?: any } = {
    ...userHeadersAndVerboseNames,
    structure_level: `Structure levels`,
    groups: `Groups`,
    number: `Participant number`,
    vote_weight: `Vote weight`,
    is_present: `Is present`,
    comment: `Comment`
};

export const participantColumnsWeight: { [key in keyof GeneralUser]?: any } = {
    title: 1,
    first_name: 2,
    last_name: 3,
    email: 4,
    member_number: 5,
    structure_level: 6,
    groups: 7,
    number: 8,
    vote_weight: 9,
    gender: 10,
    pronoun: 11,
    username: 12,
    default_password: 13,
    is_active: 14,
    is_physical_person: 15,
    is_present: 16,
    saml_id: 17,
    comment: 18
};
