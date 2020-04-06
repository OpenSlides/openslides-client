import { BaseModel } from '../base/base-model';

/**
 * Representation of a projector message.
 * @ignore
 */
export class ProjectorMessage extends BaseModel<ProjectorMessage> {
    public static COLLECTION = 'projector_message';

    public id: number;
    public message: string;

    public projection_ids: number[]; // (projection/element_id)[];
    public current_projector_ids: number[]; // (projector/current_element_ids)[]
    public meeting_id: number; // meeting/projector_message_ids;

    public constructor(input?: any) {
        super(ProjectorMessage.COLLECTION, input);
    }
}
