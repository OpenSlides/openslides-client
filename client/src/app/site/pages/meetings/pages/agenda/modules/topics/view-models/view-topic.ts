import { ProjectorTitle } from '@app/domain/interfaces';
import { Projection } from '@app/domain/models/projector/projection';
import { PROJECTIONDEFAULT, ProjectiondefaultValue } from '@app/domain/models/projector/projection-default';
import { Topic } from '@app/domain/models/topics/topic';
import type { HasListOfSpeakers } from '@app/site/pages/meetings/pages/agenda/modules/list-of-speakers/view-models/has-list-of-speakers';
import type { HasAgendaItem } from '@app/site/pages/meetings/pages/agenda/view-models/has-agenda-item';
import { BaseProjectableViewModel } from '@app/site/pages/meetings/view-models/base-projectable-model';
import type { HasMeeting } from '@app/site/pages/meetings/view-models/has-meeting';

import type { HasAttachmentMeetingMediafiles } from '../../../../mediafiles/view-models/has-attachment';
import type { HasPolls, VotingTextContext } from '../../../../polls/view-models/has-polls';

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
    extends Topic, HasAttachmentMeetingMediafiles, HasAgendaItem, HasListOfSpeakers, HasMeeting, ViewTopicRelations {}

interface ViewTopicRelations extends HasPolls<ViewTopic> {}
