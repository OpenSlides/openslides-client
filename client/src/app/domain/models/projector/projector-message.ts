import { BaseModel } from '../base/base-model';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';

/**
 * Representation of a projector message.
 * @ignore
 */
export class ProjectorMessage extends BaseModel<ProjectorMessage> {
    public static COLLECTION = `projector_message`;

    public message!: string;

    public constructor(input?: any) {
        super(ProjectorMessage.COLLECTION, input);
    }
}
export interface ProjectorMessage extends HasMeetingId, HasProjectionIds {}
