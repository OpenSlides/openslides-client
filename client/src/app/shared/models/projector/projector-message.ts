import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

/**
 * Representation of a projector message.
 * @ignore
 */
export class ProjectorMessage extends BaseModel<ProjectorMessage> {
    public static COLLECTION = 'projector_message';

    public id: Id;
    public message: string;

    public projection_ids: Id[]; // (projection/element_id)[];
    public current_projector_ids: Id[]; // (projector/current_element_ids)[]
    public meeting_id: Id; // meeting/projector_message_ids;

    public constructor(input?: any) {
        super(ProjectorMessage.COLLECTION, input);
    }
}
