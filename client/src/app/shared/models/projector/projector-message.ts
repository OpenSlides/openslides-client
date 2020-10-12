import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';
import { HasMeetingId } from '../base/has-meeting-id';
import { HasProjectableIds } from '../base/has-projectable-ids';

/**
 * Representation of a projector message.
 * @ignore
 */
export class ProjectorMessage extends BaseModel<ProjectorMessage> {
    public static COLLECTION = 'projector_message';

    public id: Id;
    public message: string;

    public constructor(input?: any) {
        super(ProjectorMessage.COLLECTION, input);
    }
}
export interface ProjectorMessage extends HasMeetingId, HasProjectableIds {}
