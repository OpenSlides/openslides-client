import { Injectable } from '@angular/core';

import { environment } from 'environments/environment.prod';
import { BehaviorSubject, Observable } from 'rxjs';

import { HttpService } from './http.service';
import { LifecycleService } from './lifecycle.service';

interface ServertimeResponse {
    server_time: number;
}

/**
 * This service provides the timeoffset to the server and a user of this service
 * can query the servertime.
 *
 * This service needs to be started with `startScheduler` which will update
 * the servertime frequently.
 */
@Injectable({
    providedIn: 'root'
})
export class ServertimeService {
    // TODO: couple this with the offlineService: Just retry often, if we are online.
    // When we are offline, this is not necessary.
    private static FAILURE_TIMEOUT = 30;
    private static NORMAL_TIMEOUT = 60 * 5;

    /**
     * The server offset in milliseconds
     */
    private serverOffsetSubject = new BehaviorSubject<number>(0);

    public constructor(private http: HttpService, private lifecycleService: LifecycleService) {
        this.lifecycleService.appLoaded.subscribe(() => this.startScheduler());
    }

    /**
     * Starts the scheduler to sync with the server.
     */
    public startScheduler(): void {
        this.scheduleNextRefresh(0.1);
    }

    /**
     * Get an observable for the server offset.
     */
    public getServerOffsetObservable(): Observable<number> {
        return this.serverOffsetSubject.asObservable();
    }

    /**
     * Schedules the next sync with the server.
     *
     * @param seconds The timeout in seconds to the refresh.
     */
    private scheduleNextRefresh(seconds: number): void {
        setTimeout(async () => {
            let timeout = ServertimeService.NORMAL_TIMEOUT;
            try {
                await this.refreshServertime();
            } catch (e) {
                timeout = ServertimeService.FAILURE_TIMEOUT;
            }
            this.scheduleNextRefresh(timeout);
        }, 1000 * seconds);
    }

    /**
     * Queries the servertime and calculates the offset.
     */
    private async refreshServertime(): Promise<void> {
        // servertime is the time in seconds.
        const payload = [
            {
                presenter: 'server_time'
            }
        ];
        const servertimeResponse = await this.http.post<ServertimeResponse[]>(
            '/system/presenter/handle_request/',
            payload
        );
        if (servertimeResponse?.length !== 1 || typeof servertimeResponse[0]?.server_time !== 'number') {
            console.error('The returned servertime has a wrong format:', servertimeResponse);
            throw new Error();
        }
        const servertime = servertimeResponse[0].server_time;
        this.serverOffsetSubject.next(Math.floor(Date.now() - servertime * 1000));
    }

    /**
     * Calculate the time of the server.
     */
    public getServertime(): number {
        return Date.now() - this.serverOffsetSubject.getValue();
    }
}
