import { BaseModel } from 'app/shared/models/base/base-model';
import { Projector } from 'app/shared/models/projector/projector';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { BaseViewModel } from '../../base/base-view-model';
import { ViewProjection } from './view-projection';
import { ViewProjectiondefault } from './view-projectiondefault';

export class ViewProjector extends BaseViewModel<Projector> {
    public static COLLECTION = Projector.COLLECTION;
    protected _collection = Projector.COLLECTION;

    public get projector(): Projector {
        return this._model;
    }

    /*public get non_stable_elements(): ProjectorElements {
        return this.projector.elements.filter(element => !element.stable);
    }*/

    public get isReferenceProjector(): boolean {
        return !!this.used_as_reference_projector_meeting_id;
    }
}
interface IProjectorRelations {
    current_projections: ViewProjection[];
    current_elements: BaseModel[];
    preview_projections: ViewProjection[];
    history_projections: ViewProjection[];
    used_as_reference_projector_in_meeting?: ViewMeeting;
    projectiondefaults: ViewProjectiondefault[];
    meeting?: ViewMeeting;
}
export interface ViewProjector extends Projector, IProjectorRelations {}
