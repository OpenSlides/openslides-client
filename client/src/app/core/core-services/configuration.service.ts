import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { CommunicationManagerService } from './communication-manager.service';
import { HttpService } from './http.service';
import { environment } from 'environments/environment';

interface Configuration {
    [key: string]: any;
}

@Injectable({
    providedIn: 'root'
})
export class ConfigurationService {
    /**
     * The constants
     */
    private configuration: Configuration = {};

    /**
     * Pending requests will be notified by these subjects, one per key.
     */
    private subjects: {[key: string]: BehaviorSubject<any>} = {};

    public constructor(communicationManagerService: CommunicationManagerService, http: HttpService) {
        console.warn('TODO: Settingsservice server-side service');

        // TODO: this is some presenter....
        communicationManagerService.startCommunicationEvent.subscribe(async () => {
            this.configuration = await http.get<Configuration>(environment.urlPrefix + '/core/constants/');
            Object.keys(this.subjects).forEach(key => {
                this.subjects[key].next(this.configuration[key]);
            });
        });
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
