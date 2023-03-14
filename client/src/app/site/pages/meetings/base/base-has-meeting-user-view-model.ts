import { BaseModel } from 'src/app/domain/models/base/base-model';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { ViewMeetingUser } from '../view-models/view-meeting-user';
import { ViewUser } from '../view-models/view-user';

/**
 * Can be extended instead of BaseViewModel if a ViewModel should contain a single ViewMeetingUser.
 */
export abstract class BaseHasMeetingUserViewModel<M extends BaseModel<any> = any> extends BaseViewModel<M> {
    public meeting_user: ViewMeetingUser;
    public get user(): ViewUser {
        return this.meeting_user?.user;
    }
    public get user_id(): number {
        return this.meeting_user?.user_id;
    }
}

/**
 * Can be extended instead of BaseViewModel if a ViewModel should contain multiple ViewMeetingUsers.
 */
export abstract class BaseHasMeetingUsersViewModel<M extends BaseModel<any> = any> extends BaseViewModel<M> {
    public meeting_users: ViewMeetingUser[];
    public get users(): ViewUser[] {
        return this.meeting_users?.flatMap(user => user.user ?? []);
    }
    public get user_ids(): number[] {
        return this.meeting_users?.flatMap(user => user.user_id ?? []);
    }
}
