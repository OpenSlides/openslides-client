import { Fqid, Id } from '../../definitions/key-types';
import { HasCollection } from '../../interfaces/has-collection';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { BaseModel } from '../base/base-model';

type ProjectionContent = HasCollection & { [key: string]: any };

export class Projection extends BaseModel<Projection> {
    public static COLLECTION = `projection`;

    public stable!: boolean;
    public type!: string;
    public options!: {
        [key: string]: any;
    };
    public weight!: number;

    // Calculated field
    public content!: ProjectionContent;

    public content_object_id!: Fqid; // */projection_ids
    public current_projector_id!: Id; // projector/current_projection_ids;
    public preview_projector_id!: Id; // projector/preview_projection_ids;
    public history_projector_id!: Id; // projector/history_projection_ids;

    public constructor(input?: any) {
        super(Projection.COLLECTION, input);
    }
}
export interface Projection extends HasMeetingId {}
