import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, filter, map, Observable } from 'rxjs';
import { OrganizationRepositoryService } from 'src/app/gateways/repositories/organization-repository.service';

import { OrganizationSetting } from '../../../../domain/models/organizations/organization';
import { ViewOrganization } from '../view-models/view-organization';
import { ORGANIZATION_ID, OrganizationService } from './organization.service';

@Injectable({
    providedIn: `root`
})
export class OrganizationSettingsService {
    /**
     * Stores a subject per key. Values are published, if the DataStore gets an update.
     */
    private settingSubjects: { [key: string]: BehaviorSubject<any> } = {};

    private hasDataSubject = new BehaviorSubject(false);

    /**
     * Listen for changes of setting variables.
     */
    public constructor(private organization: OrganizationService, private repo: OrganizationRepositoryService) {
        this.repo
            .getModifiedIdsObservable()
            .subscribe(ids => this.hasDataSubject.next(this.hasDataSubject.value || ids.includes(ORGANIZATION_ID)));

        organization.organizationObservable.subscribe(activeOrganization => {
            if (activeOrganization) {
                for (const key of Object.keys(this.settingSubjects)) {
                    this.settingSubjects[key].next(activeOrganization[key as keyof ViewOrganization] as any);
                }
            }
        });
    }

    /**
     * Get the constant named by key from the DataStore. If the DataStore isn't up to date or
     * not filled via autoupdates the results may be wrong/empty. Use this with caution.
     *
     * Usefull for synchronos code, e.g. during generation of PDFs, when the DataStore is filled.
     *
     * @param key The setting value to get from.
     */
    public instant<T extends keyof OrganizationSetting>(key: T): OrganizationSetting[T] | null {
        const organization = this.organization.organization;
        return organization ? organization[key] : null;
    }

    /**
     * Get an observer for the setting value given by the key.
     *
     * @param key The setting value to get from.
     */
    public get<T extends keyof OrganizationSetting>(key: T): Observable<OrganizationSetting[T]> {
        this.ensureSettingsSubject<T>(key);
        return this.settingSubjects[key];
    }

    /**
     * Get an observer for the setting value given by the key.
     * The observer will not emit before there is data from the organization detail subscription.
     *
     * @param key The setting value to get from.
     */
    public getSafe<T extends keyof OrganizationSetting>(key: T): Observable<OrganizationSetting[T]> {
        this.ensureSettingsSubject<T>(key);
        return combineLatest([this.settingSubjects[key], this.hasDataSubject]).pipe(
            filter(values => values[1]),
            map(values => values[0])
        );
    }

    private ensureSettingsSubject<T extends keyof OrganizationSetting>(key: T): void {
        if (!this.settingSubjects[key]) {
            this.settingSubjects[key] = new BehaviorSubject<any>(this.instant(key));
        }
    }
}
