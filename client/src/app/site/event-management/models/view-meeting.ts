import { StructuredRelation } from 'app/core/definitions/relations';
import { Meeting } from 'app/shared/models/event-management/meeting';
import { ViewAgendaItem } from 'app/site/agenda/models/view-agenda-item';
import { ViewListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { ViewAssignment } from 'app/site/assignments/models/view-assignment';
import { ViewAssignmentPoll } from 'app/site/assignments/models/view-assignment-poll';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionBlock } from 'app/site/motions/models/view-motion-block';
import { ViewMotionCategory } from 'app/site/motions/models/view-motion-category';
import { ViewMotionCommentSection } from 'app/site/motions/models/view-motion-comment-section';
import { ViewMotionPoll } from 'app/site/motions/models/view-motion-poll';
import { ViewMotionStatuteParagraph } from 'app/site/motions/models/view-motion-statute-paragraph';
import { ViewMotionWorkflow } from 'app/site/motions/models/view-motion-workflow';
import { ViewProjectiondefault } from 'app/site/projector/models/view-projection-default';
import { ViewProjector } from 'app/site/projector/models/view-projector';
import { ViewProjectorCountdown } from 'app/site/projector/models/view-projector-countdown';
import { ViewProjectorMessage } from 'app/site/projector/models/view-projector-message';
import { ViewTag } from 'app/site/tags/models/view-tag';
import { ViewTopic } from 'app/site/topics/models/view-topic';
import { ViewGroup } from 'app/site/users/models/view-group';
import { ViewUser } from 'app/site/users/models/view-user';
import { ViewCommittee } from './view-committee';

export interface MeetingTitleInformation {
    name: string;
}

export class ViewMeeting extends BaseViewModel<Meeting> implements MeetingTitleInformation {
    public static COLLECTION = Meeting.COLLECTION;
    protected _collection = Meeting.COLLECTION;

    public get meeting(): Meeting {
        return this._model;
    }
}
interface IMeetingRelations {
    motions_default_workflow: ViewMotionWorkflow;
    motions_default_statute_amendments_workflow: ViewMotionWorkflow;
    motion_poll_default_groups: ViewGroup[];
    assignment_poll_default_groups: ViewGroup[];
    projectors: ViewProjector[];
    projectiondefaults: ViewProjectiondefault[];
    projector_messages: ViewProjectorMessage[];
    projector_countdown: ViewProjectorCountdown[];
    tags: ViewTag[];
    agenda_items: ViewAgendaItem[];
    lists_of_speakers: ViewListOfSpeakers[];
    topics: ViewTopic[];
    groups: ViewGroup[];
    mediafiles: ViewMediafile[];
    motions: ViewMotion[];
    motion_comment_sections: ViewMotionCommentSection[];
    motion_categories: ViewMotionCategory[];
    motion_blocks: ViewMotionBlock[];
    motion_workflows: ViewMotionWorkflow[];
    motion_statute_paragraphs: ViewMotionStatuteParagraph[];
    motion_polls: ViewMotionPoll[];
    assignments: ViewAssignment[];
    assignment_polls: ViewAssignmentPoll[];
    logo: StructuredRelation<string, ViewMediafile | null>;
    font: StructuredRelation<string, ViewMediafile | null>;
    committee: ViewCommittee;
    default_meeting_for_committee?: ViewCommittee;
    present_users: ViewUser[];
    temorary_users: ViewUser[];
    guests: ViewUser[];
    reference_projector: ViewProjector;
}
export interface ViewMeeting extends Meeting, IMeetingRelations {}
