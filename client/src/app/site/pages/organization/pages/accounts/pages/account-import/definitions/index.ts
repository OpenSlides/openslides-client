import { User } from 'src/app/domain/models/users/user';
import { userHeadersAndVerboseNames } from 'src/app/domain/models/users/user.constants';

export const accountHeadersAndVerboseNames: { [key in keyof User]?: string } = {
    ...userHeadersAndVerboseNames,
    default_structure_level: `Structure level`,
    default_number: `Participant number`,
    default_vote_weight: `Vote weight`
};
