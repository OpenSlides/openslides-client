import { Injectable } from '@angular/core';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { ViewResource } from 'app/management/models/view-resource';
import { Resource } from 'app/shared/models/event-management/resource';
import { BehaviorSubject, Observable } from 'rxjs';

import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';
import { Identifiable } from '../../../shared/models/base/identifiable';
import { ResourceAction } from 'app/core/actions/resource-action';
import { ORGANIZATION_ID } from '../../core-services/organization.service';

@Injectable({
    providedIn: `root`
})
export class ResourceRepositoryService extends BaseRepository<ViewResource, Resource> {
    /**
     * Stores a subject per key. Values are published, if the DataStore gets an update.
     */
    private resourceSubjectMap: { [key: string]: BehaviorSubject<Resource | null> } = {};

    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Resource);
        this.getViewModelListObservable().subscribe(resources => {
            for (const key of Object.keys(this.resourceSubjectMap)) {
                this.resourceSubjectMap[key].next(resources.find(resource => resource.token === key));
            }
        });
    }

    public getTitle = (viewResource: ViewResource) => viewResource.token;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Resources` : `Resource`);

    public getFieldsets(): Fieldsets<Resource> {
        const detailFieldset: (keyof Resource)[] = [
            `id`,
            `mimetype`,
            `token`,
            `organization_id`,
            `filename`,
            `filesize`
        ];
        return {
            [DEFAULT_FIELDSET]: detailFieldset
        };
    }

    /**
     * Get the constant named by key from the DataStore. If the DataStore isn't up to date or
     * not filled via autoupdates the results may be wrong/empty. Use this with caution.
     *
     * Usefull for synchronos code, e.g. during generation of PDFs, when the DataStore is filled.
     *
     * @param key The setting value to get from.
     */
    public getResourceInstantly(token: string): Resource | null {
        return this.getViewModelList().find(resource => resource.token === token);
    }

    /**
     * Get an observer for the setting value given by the key.
     *
     * @param token The setting value to get from.
     */
    public getResourceAsObservable(token: string): Observable<Resource> {
        if (!this.resourceSubjectMap[token]) {
            this.resourceSubjectMap[token] = new BehaviorSubject<Resource | null>(this.getResourceInstantly(token));
        }
        return this.resourceSubjectMap[token].asObservable();
    }

    public upload(...resources: ResourceAction.UploadPayload[]): Promise<Identifiable[]> {
        const payload: ResourceAction.UploadPayload[] = resources.map(resource => ({
            token: resource.token,
            file: resource.file,
            filename: resource.filename,
            organization_id: ORGANIZATION_ID
        }));
        return this.sendBulkActionToBackend(ResourceAction.UPLOAD, payload);
    }

    public delete(...ids: Identifiable[]): Promise<void> {
        const payload: ResourceAction.DeletePayload[] = ids.map(({ id }) => ({ id }));
        return this.sendBulkActionToBackend(ResourceAction.DELETE, payload);
    }
}
