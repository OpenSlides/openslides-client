import { Observable } from 'rxjs';

import { StructuredRelation } from 'app/core/definitions/relations';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { Projectiondefault, Projector } from 'app/shared/models/projector/projector';
import { BaseViewModel } from '../../base/base-view-model';
import { ViewProjection } from './view-projection';

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
    meeting?: ViewMeeting;
}
export interface ViewProjector extends Projector, IProjectorRelations {}
