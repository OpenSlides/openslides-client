import { BaseModel } from '../base/base-model';

/**
 * Representation of a projection default
 *
 * @ignore
 */
export class ProjectionDefault extends BaseModel<ProjectionDefault> {
    public static COLLECTION = 'projectiondefault';

    public id: number;
    public name: string;
    public display_name: string;

    public projector_id: number; // projector/projectiondefault_ids;
    public meeting_id: number; // meeting/projectiondefault_ids;

    public constructor(input?: any) {
        super(ProjectionDefault.COLLECTION, input);
    }
}
