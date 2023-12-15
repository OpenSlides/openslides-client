import { MeetingUser } from 'src/app/domain/models/meeting-users/meeting-user';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { ViewSpeaker } from '../pages/agenda';
import { ViewAssignmentCandidate } from '../pages/assignments';
import { ViewChatMessage } from '../pages/chat';
import { ViewMotion, ViewMotionSubmitter, ViewPersonalNote } from '../pages/motions';
import { ViewGroup } from '../pages/participants';
import { ViewStructureLevel } from '../pages/participants/pages/structure-levels/view-models';
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
    vote_delegated_to: ViewMeetingUser;
    vote_delegations_from: ViewMeetingUser[];
    vote_delegated_votes: ViewVote[];
    structure_levels: ViewStructureLevel[];
}
export interface ViewMeetingUser extends MeetingUser, IMeetingUserRelations {}
