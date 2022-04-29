import { ViewProjection } from './view-projection';
import { Observable } from 'rxjs';
import { Follow } from 'src/app/site/services/model-request-builder';
import { Projector } from 'src/app/domain/models/projector/projector';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { Projectiondefault } from 'src/app/domain/models/projector/projection-default';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { StructuredRelation } from 'src/app/infrastructure/definitions/relations';
import { HasMeeting } from 'src/app/site/pages/meetings/view-models/has-meeting';

export const PROJECTOR_CONTENT_FOLLOW: Follow = {
    idField: `current_projection_ids`,
    follow: [{ idField: `content_object_id` }],
    fieldset: `content`
};

export const PROJECTOR_DETAIL_SUBSCRIPTION = `projector_detail`;

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
