import { BaseModel } from '../base/base-model';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';
import { HasMeetingId } from '../../interfaces/has-meeting-id';

/**
 * Representation of a countdown
 * @ignore
 */
export class ProjectorCountdown extends BaseModel<ProjectorCountdown> {
    public static COLLECTION = `projector_countdown`;

    public title!: string;
    public description!: string;
    public default_time!: number;
    public countdown_time!: number;
    public running!: boolean;

    public constructor(input?: any) {
        super(ProjectorCountdown.COLLECTION, input);
    }
}
export interface ProjectorCountdown extends HasMeetingId, HasProjectionIds {}
