import { ProjectionDefault } from 'app/shared/models/core/projection-default';
import { BaseViewModel } from '../../base/base-view-model';

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
export interface ViewProjectionDefault extends ProjectionDefault {}
