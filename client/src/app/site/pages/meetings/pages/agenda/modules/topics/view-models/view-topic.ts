import { ProjectorTitle } from 'src/app/domain/interfaces';
import { Projection } from 'src/app/domain/models/projector/projection';
import { PROJECTIONDEFAULT, ProjectiondefaultValue } from 'src/app/domain/models/projector/projection-default';
import { Topic } from 'src/app/domain/models/topics/topic';
import { HasAgendaItem, HasListOfSpeakers } from 'src/app/site/pages/meetings/pages/agenda';
import { BaseProjectableViewModel } from 'src/app/site/pages/meetings/view-models/base-projectable-model';
import { HasMeeting } from 'src/app/site/pages/meetings/view-models/has-meeting';

import { HasAttachmentMeetingMediafiles } from '../../../../mediafiles/view-models/has-attachment';
import { HasPolls, VotingTextContext } from '../../../../polls';

export class ViewTopic extends BaseProjectableViewModel<Topic> {
    public static COLLECTION = Topic.COLLECTION;

    public get topic(): Topic {
        return this._model;
    }

    public getVotingText(context: VotingTextContext<ViewTopic>): string {
        return `${this.getListTitle()}: ${context.poll.getTitle()}: ${context.translateFn(`Voting opened`)}`;
    }

    public override getDetailStateUrl(): string {
        return `/${this.getActiveMeetingId()}/agenda/topics/${this.sequential_number}`;
    }

    /**
     * Returns the text to be inserted in csv exports
     * @override
     */
    public getCSVExportText(): string {
        return this.text;
    }

    public getProjectiondefault(): ProjectiondefaultValue {
        return PROJECTIONDEFAULT.topics;
    }

    public hasAttachments(): boolean {
        return this.attachment_meeting_mediafiles && this.attachment_meeting_mediafiles.length > 0;
    }

    public override getProjectorTitle(_projection: Projection): ProjectorTitle {
        return { title: this.getListTitle() };
    }
}
export interface ViewTopic
    extends Topic,
    HasAttachmentMeetingMediafiles,
    HasAgendaItem,
    HasListOfSpeakers,
    HasMeeting,
    ViewTopicRelations {}

interface ViewTopicRelations extends HasPolls<ViewTopic> {}
