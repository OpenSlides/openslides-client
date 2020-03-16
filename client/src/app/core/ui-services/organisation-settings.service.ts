import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { Config } from '../../shared/models/core/config';
import { DataStoreService } from '../core-services/data-store.service';

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
    public constructor(private DS: DataStoreService) {
        this.DS.getChangeObservable(Config).subscribe(data => {
            // on changes notify the observers for specific keys.
            if (this.settingSubjects[data.key]) {
                this.settingSubjects[data.key].next(data.value);
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
    public instant<T>(key: string): T {
        const values = this.DS.filter(Config, value => value.key === key);
        if (values.length > 1) {
            throw new Error('More keys found then expected');
        } else if (values.length === 1) {
            return values[0].value as T;
        } else {
            return;
        }
    }

    /**
     * Get an observer for the setting value given by the key.
     *
     * @param key The setting value to get from.
     */
    public get<T>(key: string): Observable<T> {
        if (!this.settingSubjects[key]) {
            this.settingSubjects[key] = new BehaviorSubject<any>(this.instant(key));
        }
        return this.settingSubjects[key].asObservable() as Observable<T>;
    }
}
