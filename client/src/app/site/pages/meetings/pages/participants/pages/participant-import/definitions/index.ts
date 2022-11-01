import { User } from 'src/app/domain/models/users/user';
import { userHeadersAndVerboseNames } from 'src/app/domain/models/users/user.constants';

export const participantHeadersAndVerboseNames: { [key in keyof User]?: string } = {
    ...userHeadersAndVerboseNames,
    structure_level: `Structure level`,
    number: `Participant number`,
    vote_weight: `Vote weight`,
    is_present_in_meeting_ids: `Is present`,
    group_ids: `Groups`,
    comment: `Comment`
};
