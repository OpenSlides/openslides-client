import { MeetingUser } from 'src/app/domain/models/meeting-users/meeting-user';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { ViewSpeaker } from '../pages/agenda';
import { ViewAssignmentCandidate } from '../pages/assignments';
import { ViewChatMessage } from '../pages/chat';
import { ViewMotion, ViewMotionSubmitter, ViewPersonalNote } from '../pages/motions';
import { ViewMotionEditor } from '../pages/motions/modules/editors';
import { ViewMotionWorkingGroupSpeaker } from '../pages/motions/modules/working-group-speakers';
import { ViewGroup } from '../pages/participants';
import { ViewVote } from '../pages/polls';
import { ViewMeeting } from './view-meeting';
import { ViewUser } from './view-user';

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
    motion_editors: ViewMotionEditor[];
    motion_working_group_speakers: ViewMotionWorkingGroupSpeaker[];
    vote_delegated_to: ViewMeetingUser;
    vote_delegations_from: ViewMeetingUser[];
    vote_delegated_votes: ViewVote[];
}
export interface ViewMeetingUser extends MeetingUser, IMeetingUserRelations {}
