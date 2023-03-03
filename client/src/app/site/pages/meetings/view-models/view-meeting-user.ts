import { MeetingUser } from 'src/app/domain/models/meeting-users/meeting-user';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { ViewSpeaker } from '../pages/agenda';
import { ViewAssignmentCandidate } from '../pages/assignments';
import { ViewChatMessage } from '../pages/chat';
import { ViewMotion, ViewMotionSubmitter, ViewPersonalNote } from '../pages/motions';
import { ViewGroup } from '../pages/participants';
import { ViewMeeting } from './view-meeting';
import { ViewUser } from './view-user';

/**
 * Can be used to extend a class interface if a ViewModel should contain a single ViewUserMeeting.
 * To transfer the getters for the main user to the main ViewModel class applyMixins(<ViewModel>, [HasMeetingUser]) must be called afterwards.
 */
export class HasMeetingUser {
    public meeting_user: ViewMeetingUser;
    public get user(): ViewUser {
        return this.meeting_user?.user;
    }
    public get user_id(): number {
        return this.meeting_user?.user_id;
    }
}

/**
 * Can be used to extend a class interface if a ViewModel should contain multiple ViewUserMeeting.
 * To transfer the getters for the main users to the main ViewModel class applyMixins(<ViewModel>, [HasMeetingUsers]) must be called afterwards.
 */
export class HasMeetingUsers {
    public meeting_users: ViewMeetingUser[];
    public get users(): ViewUser[] {
        return this.meeting_users?.flatMap(user => user.user ?? []);
    }
    public get user_ids(): number[] {
        return this.meeting_users?.flatMap(user => user.user_id ?? []);
    }
}

export class ViewMeetingUser extends BaseViewModel<MeetingUser> {
    public static COLLECTION = MeetingUser.COLLECTION;

    public get meeting_user(): MeetingUser {
        return this._model;
    }
}
interface IMeetingUserRelations {
    user: ViewUser;
    groups: ViewGroup[];
    meeting: ViewMeeting;
    assignment_candidates: ViewAssignmentCandidate[];
    chat_messages: ViewChatMessage[];
    speakers: ViewSpeaker[];
    personal_notes: ViewPersonalNote[];
    supported_motions: ViewMotion[];
    submitted_motions: ViewMotionSubmitter[];
}
export interface ViewMeetingUser extends MeetingUser, IMeetingUserRelations {}
