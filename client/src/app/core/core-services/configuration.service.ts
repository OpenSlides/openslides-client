import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { HTTPMethod } from '../definitions/http-methods';
import { StreamingCommunicationService } from './streaming-communication.service';

interface Configuration {
    [key: string]: BehaviorSubject<any>;
}

@Injectable({
    providedIn: 'root'
})
export class ConfigurationService {
    /**
     * The constants
     */
    private configuration: { [key: string]: any } = {};

    /**
     * Pending requests will be notified by these subjects, one per key.
     */
    private subjects: Configuration = {};

    /**
     * @param websocketService
     */
    public constructor(streamingCommunicationService: StreamingCommunicationService) {
        console.warn('TODO: Settingsservice server-side service');

        streamingCommunicationService
            .getStream<Configuration>(HTTPMethod.GET, '/settings')
            .messageObservable.subscribe(configuration => {
                this.configuration = configuration;
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
