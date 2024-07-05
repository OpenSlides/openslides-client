import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { User } from 'src/app/domain/models/users/user';
import { userHeadersAndVerboseNames } from 'src/app/domain/models/users/user.constants';

export const accountHeadersAndVerboseNames: { [key in keyof User]?: any } = {
    ...userHeadersAndVerboseNames,
    default_vote_weight: _(`Vote weight`)
};

export const accountColumnsWeight: { [key in keyof User]?: any } = {
    title: 1,
    first_name: 2,
    last_name: 3,
    email: 4,
    member_number: 5,
    default_vote_weight: 6,
    gender: 7,
    pronoun: 8,
    username: 9,
    default_password: 10,
    is_active: 11,
    is_physical_person: 12,
    saml_id: 13
};
