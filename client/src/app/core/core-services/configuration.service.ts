import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { HttpService } from './http.service';
import { LifecycleService } from './lifecycle.service';

interface Configuration {
    [key: string]: any;
}

@Injectable({
    providedIn: `root`
})
export class ConfigurationService {
    /**
     * The constants
     */
    private configuration: Configuration = {};

    /**
     * Pending requests will be notified by these subjects, one per key.
     */
    private subjects: { [key: string]: BehaviorSubject<any> } = {};

    public constructor(lifecycleService: LifecycleService, http: HttpService) {
        console.warn(`TODO: Settingsservice server-side service`);

        // TODO: this is some presenter....
        /*lifecycleService.openslidesBooted.subscribe(async () => {
            this.configuration = await http.get<Configuration>(environment.urlPrefix + '/core/constants/');
            Object.keys(this.subjects).forEach(key => {
                this.subjects[key].next(this.configuration[key]);
            });
        });*/
    }

    /**
     * Get the constant named by key.
     * @param key The constant to get.
     */
    public get<T>(key: string): Observable<T> {
        if (!this.subjects[key]) {
            this.subjects[key] = new BehaviorSubject<any>(this.configuration[key]);
        }
        return this.subjects[key].asObservable().pipe(filter(x => !!x));
    }
}
