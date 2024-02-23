import { userHeadersAndVerboseNames } from 'src/app/domain/models/users/user.constants';
import { GeneralUser } from 'src/app/gateways/repositories/users';

export const participantHeadersAndVerboseNames: { [key in keyof GeneralUser]?: string } = {
    ...userHeadersAndVerboseNames,
    is_present: `Is present`,
    structure_level: `Structure levels`,
    number: `Participant number`,
    vote_weight: `Vote weight`,
    groups: `Groups`,
    comment: `Comment`,
    structure_level: `Structure levels`
};
