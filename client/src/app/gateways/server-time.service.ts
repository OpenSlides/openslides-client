import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LifecycleService } from 'src/app/site/services/lifecycle.service';

@Injectable({
    providedIn: `root`
})
export class ServerTimeService {
    // TODO: couple this with the offlineService: Just retry often, if we are online.
    // When we are offline, this is not necessary.
    private static readonly FAILURE_TIMEOUT = 30;
    private static readonly NORMAL_TIMEOUT = 60 * 5;

    /**
     * The server offset in milliseconds
     */
    private readonly _serverOffsetSubject = new BehaviorSubject<number>(0);

    public constructor(lifecycleService: LifecycleService) {
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
            let timeout = ServerTimeService.NORMAL_TIMEOUT;
            try {
                await this.refreshServertime();
            } catch (e) {
                timeout = ServerTimeService.FAILURE_TIMEOUT;
            }
            this.scheduleNextRefresh(timeout);
        }, 1000 * seconds);
    }

    /**
     * Queries the servertime and calculates the offset.
     */
    private async refreshServertime(): Promise<void> {
        // servertime is the time in seconds.
        const servertimeResponse = await fetch(`/assets/time.txt?${Date.now()}`, {
            credentials: `omit`,
            headers: {
                'ngsw-bypass': `true`,
                cache: `no-store`
            }
        });
        const date = new Date(servertimeResponse.headers.get(`Date`));
        if (servertimeResponse.headers.get(`Date`) && !isNaN(date.valueOf())) {
            const serverTime = date.getTime();
            this._serverOffsetSubject.next(Math.floor(Date.now() - serverTime));
        } else {
            console.error(`The returned servertime has a wrong format:`, servertimeResponse);
            throw new Error(`Could not fetch server time`);
        }
    }

    /**
     * Calculate the time of the server.
     */
    public getServertime(): number {
        return Date.now() - this._serverOffsetSubject.getValue();
    }
}
