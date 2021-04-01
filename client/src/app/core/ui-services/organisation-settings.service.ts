import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { OrganisationSetting } from 'app/shared/models/event-management/organisation';
import { CustomTranslationService } from '../translate/custom-translation.service';
import { OrganisationService } from '../core-services/organisation.service';

/**
 * Handler for setting variables for organsations.
 *
 * @example
 * ```ts
 * this.organisationSettingsService.get('general_event_name').subscribe(value => {
 *     console.log(value);
 * });
 * ```
 *
 * @example
 * ```ts
 * const value = this.organisationSettingsService.instant('general_event_name');
 * ```
 */
@Injectable({
    providedIn: 'root'
})
export class OrganisationSettingsService {
    /**
     * Stores a subject per key. Values are published, if the DataStore gets an update.
     */
    private settingSubjects: { [key: string]: BehaviorSubject<any> } = {};

    /**
     * Listen for changes of setting variables.
     */
    public constructor(private organisation: OrganisationService, private ctService: CustomTranslationService) {
        organisation.organisationObservable.subscribe(activeOrganisation => {
            if (activeOrganisation) {
                for (const key of Object.keys(this.settingSubjects)) {
                    this.settingSubjects[key].next(activeOrganisation[key]);
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
    public instant<T extends keyof OrganisationSetting>(key: T): OrganisationSetting[T] | null {
        const organisation = this.organisation.organisation;
        return organisation ? organisation[key] : null;
    }

    /**
     * Get an observer for the setting value given by the key.
     *
     * @param key The setting value to get from.
     */
    public get<T extends keyof OrganisationSetting>(key: T): Observable<OrganisationSetting[T]> {
        if (!this.settingSubjects[key]) {
            this.settingSubjects[key] = new BehaviorSubject<any>(this.instant(key));
        }
        return this.settingSubjects[key].asObservable();
    }
}
