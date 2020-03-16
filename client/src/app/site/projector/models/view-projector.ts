import { Projector, ProjectorElements } from 'app/shared/models/core/projector';
import { BaseViewModel } from '../../base/base-view-model';

export interface ProjectorTitleInformation {
    name: string;
}

export class ViewProjector extends BaseViewModel<Projector> {
    public static COLLECTION = Projector.COLLECTION;
    protected _collection = Projector.COLLECTION;

    public get projector(): Projector {
        return this._model;
    }

    public get non_stable_elements(): ProjectorElements {
        return this.projector.elements.filter(element => !element.stable);
    }

    public get isReferenceProjector(): boolean {
        return this.id === this.reference_projector_id;
    }
}
interface IProjectorRelations {
    referenceProjector: ViewProjector;
}
export interface ViewProjector extends Projector, IProjectorRelations {}
