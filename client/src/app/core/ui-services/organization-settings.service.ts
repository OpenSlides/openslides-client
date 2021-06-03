import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { OrganizationSetting } from 'app/shared/models/event-management/organization';
import { CustomTranslationService } from '../translate/custom-translation.service';
import { OrganizationService } from '../core-services/organization.service';

/**
 * Handler for setting variables for organsations.
 *
 * @example
 * ```ts
 * this.organizationSettingsService.get('general_event_name').subscribe(value => {
 *     console.log(value);
 * });
 * ```
 *
 * @example
 * ```ts
 * const value = this.organizationSettingsService.instant('general_event_name');
 * ```
 */
@Injectable({
    providedIn: 'root'
})
export class OrganizationSettingsService {
    /**
     * Stores a subject per key. Values are published, if the DataStore gets an update.
     */
    private settingSubjects: { [key: string]: BehaviorSubject<any> } = {};

    /**
     * Listen for changes of setting variables.
     */
    public constructor(private organization: OrganizationService, private ctService: CustomTranslationService) {
        organization.organizationObservable.subscribe(activeOrganization => {
            if (activeOrganization) {
                for (const key of Object.keys(this.settingSubjects)) {
                    this.settingSubjects[key].next(activeOrganization[key]);
                }
            }
        });
        this.get('custom_translations').subscribe((ct: any) => this.ctService.customTranslationSubject.next(ct));
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
        return this.settingSubjects[key].asObservable();
    }
}
