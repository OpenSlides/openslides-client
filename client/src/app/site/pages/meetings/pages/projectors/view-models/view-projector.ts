import { Observable } from 'rxjs';
import { Projectiondefault } from 'src/app/domain/models/projector/projection-default';
import { Projector } from 'src/app/domain/models/projector/projector';
import { StructuredRelation } from 'src/app/infrastructure/definitions/relations';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { HasMeeting } from 'src/app/site/pages/meetings/view-models/has-meeting';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { Follow } from 'src/app/site/services/model-request-builder';

import { ViewProjection } from './view-projection';

export const PROJECTOR_CONTENT_FOLLOW: Follow = {
    idField: `current_projection_ids`,
    follow: [{ idField: `content_object_id` }],
    fieldset: `content`
};

export class ViewProjector extends BaseViewModel<Projector> {
    public static COLLECTION = Projector.COLLECTION;
    protected _collection = Projector.COLLECTION;

    public get projector(): Projector {
        return this._model;
    }

    public get isReferenceProjector(): boolean {
        return !!this.used_as_reference_projector_meeting_id;
    }

    public get nonStableCurrentProjections(): ViewProjection[] {
        return this.current_projections.filter(projection => !projection.stable);
    }
}
interface IProjectorRelations {
    current_projections: ViewProjection[];
    current_projections_as_observable: Observable<ViewProjection[]>;
    preview_projections: ViewProjection[];
    history_projections: ViewProjection[];
    used_as_reference_projector_in_meeting?: ViewMeeting;
    used_as_default_in_meeting: StructuredRelation<Projectiondefault, ViewMeeting | null>;
}
export interface ViewProjector extends Projector, IProjectorRelations, HasMeeting {}
