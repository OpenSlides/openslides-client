import { BaseModel } from 'app/shared/models/base/base-model';
import { Projection } from 'app/shared/models/projector/projection';
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
    projector_history?: ViewProjector;
    projector_preview?: ViewProjector;
    element: BaseModel;
}
export interface ViewProjection extends Projection, IProjectionRelations {}
