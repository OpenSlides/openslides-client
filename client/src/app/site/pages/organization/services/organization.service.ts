import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ModelRequestService } from 'src/app/site/services/model-request.service';

import { OrganizationRepositoryService } from '../../../../gateways/repositories/organization-repository.service';
import { ModelSubscription } from '../../../services/autoupdate';
import { LifecycleService } from '../../../services/lifecycle.service';
import { getMeetingListSubscriptionConfig, getOrganizationSubscriptionConfig } from '../organization.subscription';
import { ViewOrganization } from '../view-models/view-organization';

/**
 * The organization_id is always the 1.
 */
export const ORGANIZATION_ID = 1;

@Injectable({
    providedIn: `root`
})
export class OrganizationService {
    public get organizationObservable(): Observable<ViewOrganization | null> {
        return this.organizationSubject;
    }

    public get organization(): ViewOrganization | null {
        return this.organizationSubject.value;
    }

    public get currentActiveMeetings(): number {
        return this.organization?.active_meeting_ids?.length || 0;
    }

    private organizationSubject = new BehaviorSubject<ViewOrganization | null>(null);

    private modelSubscription: ModelSubscription | null = null;

    private _hasInitiated = false;

    public constructor(
        private repo: OrganizationRepositoryService,
        private modelRequestService: ModelRequestService,
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
        if (!this._hasInitiated) {
            this._hasInitiated = true;
            this.modelRequestService.subscribeTo(getOrganizationSubscriptionConfig());
            this.modelRequestService.subscribeTo(getMeetingListSubscriptionConfig());
            this.repo
                .getViewModelObservable(ORGANIZATION_ID)
                .subscribe(organization => this.organizationSubject.next(organization));
        }
    }
}
