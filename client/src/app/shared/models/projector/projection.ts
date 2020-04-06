import { Fqid, Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

export class Projection extends BaseModel<Projection> {
    public static COLLECTION = 'projection';

    public id: Id;
    public options: object;

    public current_projector_id: Id; // projector/current_projection_ids;
    public projector_history_id: Id; // projector/elements_preview;
    public projector_preview_id: Id; // projector/elements_history;
    public element_id: Fqid; // */projection_ids;

    public constructor(input?: any) {
        super(Projection.COLLECTION, input);
    }
}
