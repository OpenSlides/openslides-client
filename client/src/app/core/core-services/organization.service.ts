import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { ViewOrganization } from 'app/management/models/view-organization';
import { AutoupdateService, ModelSubscription } from './autoupdate.service';
import { LifecycleService } from './lifecycle.service';
import { SimplifiedModelRequest } from './model-request-builder.service';
import { OrganizationRepositoryService } from '../repositories/management/organization-repository.service';

/**
 * Token to get a resource dedicated to the `logo_web_header` of an organization.
 */
export const WEB_HEADER_TOKEN = 'web_header';

/**
 * The organization_id is always the 1.
 */
export const ORGANIZATION_ID = 1;

@Injectable({
    providedIn: 'root'
})
export class OrganizationService {
    public get organizationObservable(): Observable<ViewOrganization | null> {
        return this.organizationSubject.asObservable();
    }

    public get organization(): ViewOrganization | null {
        return this.organizationSubject.value;
    }

    public get currentActiveMeetings(): number {
        return this.organization.active_meeting_ids?.length || 0;
    }

    private organizationSubject = new BehaviorSubject<ViewOrganization | null>(null);

    private modelSubscription: ModelSubscription | null = null;

    public constructor(
        private repo: OrganizationRepositoryService,
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
        this.modelSubscription = await this.autoupdateService.subscribe(this.getModelRequest(), 'OrganizationService');
        this.repo
            .getViewModelObservable(ORGANIZATION_ID)
            .subscribe(organization => this.organizationSubject.next(organization));
    }

    private getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewOrganization,
            ids: [ORGANIZATION_ID],
            follow: [{ idField: 'resource_ids' }],
            fieldset: 'settings'
        };
    }
}
