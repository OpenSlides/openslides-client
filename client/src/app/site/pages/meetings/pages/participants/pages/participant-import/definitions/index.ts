import { User } from 'src/app/domain/models/users/user';
import { userHeadersAndVerboseNames } from 'src/app/domain/models/users/user.constants';

export const participantHeadersAndVerboseNames: { [key in keyof User]?: string } = {
    ...userHeadersAndVerboseNames,
    number: `Participant number`,
    structure_level: `Structure level`,
    vote_weight: `Vote weight`,
    comment: `Comment`,
    is_present_in_meeting_ids: `Is present`,
    group_ids: `Groups`
};
