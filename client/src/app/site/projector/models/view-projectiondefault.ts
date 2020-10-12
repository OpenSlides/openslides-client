import { Projectiondefault } from 'app/shared/models/projector/projection-default';
import { HasMeeting, ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { BaseViewModel } from '../../base/base-view-model';
import { ViewProjector } from './view-projector';

export class ViewProjectiondefault extends BaseViewModel<Projectiondefault> {
    public static COLLECTION = Projectiondefault.COLLECTION;
    protected _collection = Projectiondefault.COLLECTION;

    public get projectionDefault(): Projectiondefault {
        return this._model;
    }
}
interface IProjectionDefaultRelations {
    projector: ViewProjector;
}
export interface ViewProjectiondefault extends Projectiondefault, IProjectionDefaultRelations, HasMeeting {}
