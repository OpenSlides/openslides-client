import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { User } from 'src/app/domain/models/users/user';
import { userHeadersAndVerboseNames } from 'src/app/domain/models/users/user.constants';

export const accountHeadersAndVerboseNames: { [key in keyof User]?: string } = {
    ...userHeadersAndVerboseNames,
    default_structure_level: _(`Structure level`),
    default_vote_weight: _(`Vote weight`)
};
