import { User } from 'app/shared/models/users/user';
import { BaseUserHeaders, BaseUserHeadersAndVerboseNames } from 'app/site/users/base/base-user.constants';

/**
 * Helper for mapping the expected header in a typesafe way. Values and order
 * will be passed to {@link expectedHeader}
 */
export const headerMap: (keyof User)[] = [...BaseUserHeaders, `comment`, `is_present_in_meeting_ids`, `group_ids`];

export const userHeadersAndVerboseNames: { [key: string]: string } = {
    ...BaseUserHeadersAndVerboseNames,
    comment: `Comment`,
    is_present_in_meeting_ids: `Is present`,
    group_ids: `Groups`
};
