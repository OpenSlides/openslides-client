import { BaseModel } from '../base/base-model';

export class Projection extends BaseModel<Projection> {
    public static COLLECTION = 'projection';

    public id: number;
    public options: object;

    public current_projector_id: number; // projector/current_projection_ids;
    public projector_history_id: number; // projector/elements_preview;
    public projector_preview_id: number; // projector/elements_history;
    public element_id: string; // */projection_ids;

    public constructor(input?: any) {
        super(Projection.COLLECTION, input);
    }
}
