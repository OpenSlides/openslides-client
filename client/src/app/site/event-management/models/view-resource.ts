import { Resource } from 'app/shared/models/event-management/resource';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewOrganisation } from './view-organisation';

export interface ResourceTitleInformation {
    token: string;
}

export class ViewResource extends BaseViewModel<Resource> implements ResourceTitleInformation {
    public static COLLECTION = Resource.COLLECTION;
    protected _collection = Resource.COLLECTION;

    public get resource(): Resource {
        return this._model;
    }
}
interface IResourceRelations {
    organisation: ViewOrganisation;
}
export interface ViewResource extends Resource, IResourceRelations {}
