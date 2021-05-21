import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { ViewOrganisation } from 'app/management/models/view-organisation';
import { AutoupdateService, ModelSubscription } from './autoupdate.service';
import { LifecycleService } from './lifecycle.service';
import { SimplifiedModelRequest } from './model-request-builder.service';
import { OrganisationRepositoryService } from '../repositories/management/organisation-repository.service';

/**
 * Token to get a resource dedicated to the `logo_web_header` of an organisation.
 */
export const WEB_HEADER_TOKEN = 'web_header';

/**
 * The organisation_id is always the 1.
 */
export const ORGANISATION_ID = 1;

@Injectable({
    providedIn: 'root'
})
export class OrganisationService {
    public get organisationObservable(): Observable<ViewOrganisation | null> {
        return this.organisationSubject.asObservable();
    }

    public get organisation(): ViewOrganisation | null {
        return this.organisationSubject.value;
    }

    private organisationSubject = new BehaviorSubject<ViewOrganisation | null>(null);

    private modelSubscription: ModelSubscription | null = null;

    public constructor(
        private repo: OrganisationRepositoryService,
        private autoupdateService: AutoupdateService,
        lifecycle: LifecycleService
    ) {
        lifecycle.openslidesBooted.subscribe(async () => await this.setupModelSubscription());
        lifecycle.openslidesShutdowned.subscribe(() => this.destroy());
    }

    private destroy(): void {
        if (this.modelSubscription) {
            this.modelSubscription.close();
            this.modelSubscription = null;
        }
    }

    private async setupModelSubscription(): Promise<void> {
        this.modelSubscription = await this.autoupdateService.simpleRequest(
            this.getModelRequest(),
            'OrganisationService'
        );
        this.repo
            .getViewModelObservable(ORGANISATION_ID)
            .subscribe(organisation => this.organisationSubject.next(organisation));
    }

    private getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewOrganisation,
            ids: [ORGANISATION_ID],
            follow: [{ idField: 'resource_ids' }],
            fieldset: 'settings'
        };
    }
}
