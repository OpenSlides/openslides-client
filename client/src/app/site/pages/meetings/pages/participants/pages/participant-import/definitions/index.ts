import { userHeadersAndVerboseNames } from 'src/app/domain/models/users/user.constants';
import { GeneralUser } from 'src/app/gateways/repositories/users';

export const participantHeadersAndVerboseNames: { [key in keyof GeneralUser]?: string } = {
    ...userHeadersAndVerboseNames,
    number: `Participant number`,
    vote_weight: `Vote weight`,
    is_present_in_meeting_ids: `Is present`,
    group_ids: `Groups`,
    comment: `Comment`
};
