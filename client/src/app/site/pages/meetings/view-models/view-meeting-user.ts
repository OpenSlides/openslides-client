import { Id } from '@app/domain/definitions/key-types';
import { MeetingUser } from '@app/domain/models/meeting-users/meeting-user';
import { BaseViewModel, ViewModelRelations } from '@app/site/base/base-view-model';

import { ViewSpeaker } from '../pages/agenda';
import { ViewAssignmentCandidate } from '../pages/assignments';
import { ViewChatMessage } from '../pages/chat';
import { ViewMotionSubmitter, ViewPersonalNote } from '../pages/motions';
import { ViewMotionEditor } from '../pages/motions/modules/editors';
import { ViewMotionSupporter } from '../pages/motions/modules/supporters/view-models/view-motion-supporter';
import { ViewMotionWorkingGroupSpeaker } from '../pages/motions/modules/working-group-speakers';
import { ViewGroup } from '../pages/participants';
import { ViewStructureLevel } from '../pages/participants/pages/structure-levels/view-models';
import { ViewPoll, ViewPollBallot, ViewPollOption } from '../pages/polls';
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
    poll_voted: ViewPoll;
    acting_ballots: ViewPollBallot[];
    represented_ballots: ViewPollBallot[];
    vote_delegated_to: ViewMeetingUser;
    vote_delegations_from: ViewMeetingUser[];
    structure_levels: ViewStructureLevel[];
    poll_options: ViewPollOption[];
}
export interface ViewMeetingUser extends MeetingUser, ViewModelRelations<IMeetingUserRelations> {}
