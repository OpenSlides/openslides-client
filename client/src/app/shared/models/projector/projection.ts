import { Fqid, Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';
import { HasMeetingId } from '../base/has-meeting-id';

export class Projection extends BaseModel<Projection> {
    public static COLLECTION = 'projection';

    public id: Id;
    public stable?: boolean;
    public type?: string;
    public options: object;
    public weight: number;

    // Calculated field
    public content: any;

    public content_object_id: Fqid; // */projection_ids
    public current_projector_id: Id; // projector/current_projection_ids;
    public preview_projector_id: Id; // projector/preview_projection_ids;
    public history_projector_id: Id; // projector/history_projection_ids;

    public constructor(input?: any) {
        super(Projection.COLLECTION, input);
    }
}
export interface Projection extends HasMeetingId {}
