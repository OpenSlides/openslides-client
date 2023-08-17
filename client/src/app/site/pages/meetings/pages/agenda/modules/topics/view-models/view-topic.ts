import { PROJECTIONDEFAULT, ProjectiondefaultValue } from 'src/app/domain/models/projector/projection-default';
import { Topic } from 'src/app/domain/models/topics/topic';
import { HasAgendaItem, HasListOfSpeakers } from 'src/app/site/pages/meetings/pages/agenda';
import { BaseProjectableViewModel } from 'src/app/site/pages/meetings/view-models/base-projectable-model';
import { HasMeeting } from 'src/app/site/pages/meetings/view-models/has-meeting';

import { HasAttachment } from '../../../../mediafiles/view-models/has-attachment';
import { HasPolls, VotingTextContext } from '../../../../polls';

export class ViewTopic extends BaseProjectableViewModel<Topic> {
    public static COLLECTION = Topic.COLLECTION;

    public get topic(): Topic {
        return this._model;
    }

    public getVotingText(context: VotingTextContext<ViewTopic>): string {
        return `${this.getTitle()}: ${context.poll.getTitle()}: ${context.translateFn(`Voting opened`)}`;
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
        return this.attachments && this.attachments.length > 0;
    }
}
export interface ViewTopic
    extends Topic,
        HasAttachment,
        HasAgendaItem,
        HasListOfSpeakers,
        HasMeeting,
        ViewTopicRelations {}

interface ViewTopicRelations extends HasPolls<ViewTopic> {}
