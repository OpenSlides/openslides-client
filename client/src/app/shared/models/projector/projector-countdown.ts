import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';
import { HasProjectableIds } from '../base/has-projectable-ids';

/**
 * Representation of a countdown
 * @ignore
 */
export class ProjectorCountdown extends BaseModel<ProjectorCountdown> {
    public static COLLECTION = 'projector_countdown';

    public id: Id;
    public title: string;
    public description?: string;
    public default_time: number;
    public countdown_time: number;
    public running: boolean;

    public meeting_id: Id; // meeting/projector_countdown_ids;

    public constructor(input?: any) {
        super(ProjectorCountdown.COLLECTION, input);
    }
}
export interface ProjectorCountdown extends HasProjectableIds {}
