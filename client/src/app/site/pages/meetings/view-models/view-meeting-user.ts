import { Id } from '@app/domain/definitions/key-types';
import { MeetingUser } from '@app/domain/models/meeting-users/meeting-user';
import { BaseViewModel, ViewModelRelations } from '@app/site/base/base-view-model';

import { ViewSpeaker } from '../pages/agenda/modules/list-of-speakers/view-models/view-speaker';
import { ViewAssignmentCandidate } from '../pages/assignments/view-models/view-assignment-candidate';
import { ViewChatMessage } from '../pages/chat/view-models/view-chat-message';
import { ViewMotionEditor } from '../pages/motions/modules/editors/view-models/view-motion-editor';
import { ViewPersonalNote } from '../pages/motions/modules/personal-notes/view-models/view-personal-note';
import { ViewMotionSubmitter } from '../pages/motions/modules/submitters/view-models/view-motion-submitter';
import { ViewMotionSupporter } from '../pages/motions/modules/supporters/view-models/view-motion-supporter';
import { ViewMotionWorkingGroupSpeaker } from '../pages/motions/modules/working-group-speakers/view-models/view-motion-working-group-speaker';
import { ViewGroup } from '../pages/participants/modules/groups/view-models/view-group';
import { ViewStructureLevel } from '../pages/participants/pages/structure-levels/view-models/view-structure-level';
import { ViewPollBallot } from '../pages/polls/view-models/poll-ballot';
import { ViewPollBallotUser } from '../pages/polls/view-models/poll-ballot-user';
import { ViewPollEntitledUser } from '../pages/polls/view-models/poll-entitled-user';
import { ViewPollOption } from '../pages/polls/view-models/poll-option';
import { ViewMeeting } from './view-meeting';
import { ViewUser } from './view-user';

export class ViewMeetingUser extends BaseViewModel<MeetingUser> {
    public static COLLECTION = MeetingUser.COLLECTION;

    public get meeting_user(): MeetingUser {
        return this._model;
    }

    public structureLevels(): string {
        return (this.structure_levels || []).map(sl => sl.name).join(`, `);
    }

    public getSupporter(motion_id: Id): ViewMotionSupporter | undefined {
        return this.motion_supporters.find(sup => sup.motion_id === motion_id);
    }
}
interface IMeetingUserRelations {
    ballots: ViewPollBallot;
    user: ViewUser;
    groups: ViewGroup[];
    meeting: ViewMeeting;
    assignment_candidates: ViewAssignmentCandidate[];
    chat_messages: ViewChatMessage[];
    speakers: ViewSpeaker[];
    personal_notes: ViewPersonalNote[];
    motion_supporters: ViewMotionSupporter[];
    submitted_motions: ViewMotionSubmitter[];
    motion_editors: ViewMotionEditor[];
    motion_working_group_speakers: ViewMotionWorkingGroupSpeaker[];
    acting_ballots: ViewPollBallotUser[];
    represented_ballots: ViewPollBallotUser[];
    vote_delegated_to: ViewMeetingUser;
    vote_delegations_from: ViewMeetingUser[];
    structure_levels: ViewStructureLevel[];
    poll_options: ViewPollOption[];
    poll_entitled_users: ViewPollEntitledUser[];
}
export interface ViewMeetingUser extends MeetingUser, ViewModelRelations<IMeetingUserRelations> {}
