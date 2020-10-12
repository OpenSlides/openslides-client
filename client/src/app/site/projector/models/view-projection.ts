import { BaseModel } from 'app/shared/models/base/base-model';
import { Projection } from 'app/shared/models/projector/projection';
import { HasMeeting } from 'app/site/event-management/models/view-meeting';
import { BaseViewModel } from '../../base/base-view-model';
import { ViewProjector } from './view-projector';

export class ViewProjection extends BaseViewModel<Projection> {
    public static COLLECTION = Projection.COLLECTION;
    protected _collection = Projection.COLLECTION;

    public get projection(): Projection {
        return this._model;
    }
}
interface IProjectionRelations {
    current_projector?: ViewProjector;
    preview_projector?: ViewProjector;
    history_projector?: ViewProjector;
    element: BaseModel;
}
export interface ViewProjection extends Projection, IProjectionRelations, HasMeeting {}
