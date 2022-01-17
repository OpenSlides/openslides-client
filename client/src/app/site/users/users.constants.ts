import { User } from 'app/shared/models/users/user';
import { memberHeadersAndVerboseNames } from 'app/site/users/base/base-user.constants';

export const userHeadersAndVerboseNames: { [key in keyof User]?: string } = {
    ...memberHeadersAndVerboseNames,
    comment: `Comment`,
    is_present_in_meeting_ids: `Is present`,
    group_ids: `Groups`
};
