import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LifecycleService } from 'src/app/site/services/lifecycle.service';

import { HttpService } from '../http.service';

@Injectable({
    providedIn: `root`
})
export class ServerTimePresenterService {
    // TODO: couple this with the offlineService: Just retry often, if we are online.
    // When we are offline, this is not necessary.
    private static readonly FAILURE_TIMEOUT = 30;
    private static readonly NORMAL_TIMEOUT = 60 * 5;

    /**
     * The server offset in milliseconds
     */
    private readonly _serverOffsetSubject = new BehaviorSubject<number>(0);

    public constructor(
        lifecycleService: LifecycleService,
        private http: HttpService
    ) {
        lifecycleService.appLoaded.subscribe(() => this.startScheduler());
    }

    /**
     * Starts the scheduler to sync with the server.
     */
    private startScheduler(): void {
        this.scheduleNextRefresh(0.1);
    }

    /**
     * Get an observable for the server offset.
     */
    public getServerOffsetObservable(): Observable<number> {
        return this._serverOffsetSubject;
    }

    /**
     * Schedules the next sync with the server.
     *
     * @param seconds The timeout in seconds to the refresh.
     */
    private scheduleNextRefresh(seconds: number): void {
        setTimeout(async () => {
            let timeout = ServerTimePresenterService.NORMAL_TIMEOUT;
            try {
                await this.refreshServertime();
            } catch (e) {
                timeout = ServerTimePresenterService.FAILURE_TIMEOUT;
            }
            this.scheduleNextRefresh(timeout);
        }, 1000 * seconds);
    }

    /**
     * Queries the servertime and calculates the offset.
     */
    private async refreshServertime(): Promise<void> {
        // servertime is the time in seconds.
        const servertimeResponse = await fetch(`/`, {
            headers: {
                'ngsw-bypass': `true`
            }
        });
        const serverDate = new Date(servertimeResponse.headers.get(`Date`));
        const serverTime = serverDate.getTime();
        this._serverOffsetSubject.next(Math.floor(Date.now() - serverTime));
    }

    /**
     * Calculate the time of the server.
     */
    public getServertime(): number {
        return Date.now() - this._serverOffsetSubject.getValue();
    }
}
