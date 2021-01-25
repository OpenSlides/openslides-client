import { AgendaItemVisibility } from 'app/shared/models/agenda/agenda-item';
import { Topic } from 'app/shared/models/topics/topic';

/**
 * Representation of Topic during creation.
 */
export class CreateTopic extends Topic {
    public attachment_ids: number[];
    public agenda_type: AgendaItemVisibility;
    public agenda_parent_id: number;
    public agenda_comment: string;
    public agenda_duration: number;
    public agenda_weight: number;

    /**
     * Checks if the CreateTopic is valid. Currently only requires an existing title
     *
     * @returns true if it is a valid Topic
     */
    public get isValid(): boolean {
        return this.title ? true : false;
    }

    public constructor(input?: Partial<CreateTopic>) {
        super(input);
    }
}
