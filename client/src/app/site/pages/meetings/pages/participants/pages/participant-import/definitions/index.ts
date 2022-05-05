import { User } from 'src/app/domain/models/users/user';
import { userHeadersAndVerboseNames } from 'src/app/domain/models/users/user.constants';

export const PARTICIPANT_HEADERS_AND_VERBOSE_NAMES: { [key in keyof User]?: string } = {
    ...userHeadersAndVerboseNames,
    comment: `Comment`,
    is_present_in_meeting_ids: `Is present`,
    group_ids: `Groups`
};
