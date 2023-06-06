import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { OrganizationSetting } from '../../../../domain/models/organizations/organization';
import { ViewOrganization } from '../view-models/view-organization';
import { OrganizationService } from './organization.service';

@Injectable({
    providedIn: `root`
})
export class OrganizationSettingsService {
    /**
     * Stores a subject per key. Values are published, if the DataStore gets an update.
     */
    private settingSubjects: { [key: string]: BehaviorSubject<any> } = {};

    /**
     * Listen for changes of setting variables.
     */
    public constructor(private organization: OrganizationService) {
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
        if (!this.settingSubjects[key]) {
            this.settingSubjects[key] = new BehaviorSubject<any>(this.instant(key));
        }
        return this.settingSubjects[key];
    }
}
