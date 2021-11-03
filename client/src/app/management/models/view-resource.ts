import { Resource } from 'app/shared/models/event-management/resource';
import { BaseViewModel } from 'app/site/base/base-view-model';

import { ViewOrganization } from './view-organization';
export class ViewResource extends BaseViewModel<Resource> {
    public static COLLECTION = Resource.COLLECTION;
    protected _collection = Resource.COLLECTION;

    public get resource(): Resource {
        return this._model;
    }
}
interface IResourceRelations {
    organization: ViewOrganization;
}
export interface ViewResource extends Resource, IResourceRelations {}
