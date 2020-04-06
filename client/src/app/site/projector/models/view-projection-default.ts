import { ProjectionDefault } from 'app/shared/models/projector/projection-default';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { BaseViewModel } from '../../base/base-view-model';
import { ViewProjector } from './view-projector';

export interface ProjectionDefaultTitleInformation {
    display_name: string;
}

export class ViewProjectionDefault extends BaseViewModel<ProjectionDefault>
    implements ProjectionDefaultTitleInformation {
    public static COLLECTION = ProjectionDefault.COLLECTION;
    protected _collection = ProjectionDefault.COLLECTION;

    public get projectionDefault(): ProjectionDefault {
        return this._model;
    }
}
interface IProjectionDefaultRelations {
    projector: ViewProjector;
    meeting: ViewMeeting;
}
export interface ViewProjectionDefault extends ProjectionDefault, IProjectionDefaultRelations {}
