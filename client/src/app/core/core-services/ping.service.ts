import { Injectable } from '@angular/core';

@Injectable({
    providedIn: `root`
})
export class PingService {
    /**
     * The interval.
     */
    /*private pingInterval: any;

    private intervalTime = 30000;

    private timeoutTime = 5000;

    private lastLatency: number | null = null;*/

    public constructor() {
        console.warn(`TODO: Enable Ping service`);
        // this.setup();
    }

    /*private async setup(): Promise<void> {
        this.intervalTime =
            (await this.configurationService
                .get<number>('PING_INTERVAL')
                .pipe(take(1))
                .toPromise()) || 30000;
        this.timeoutTime =
            (await this.configurationService
                .get<number>('PING_TIMEOUT')
                .pipe(take(1))
                .toPromise()) || 5000;

        // Connects the ping-pong mechanism to the opening and closing of the connection.
        this.websocketService.closeEvent.subscribe(() => this.stopPing());
        this.websocketService.generalConnectEvent.subscribe(() => this.startPing());
        if (this.websocketService.isConnected) {
            this.startPing();
        }
    }*/

    /**
     * Starts the ping-mechanism
     */
    /*private startPing(): void {
        if (this.pingInterval) {
            return;
        }

        this.pingInterval = setInterval(async () => {
            const start = performance.now();
            try {
                await TimeoutPromise(
                    this.websocketService.sendAndGetResponse('ping', this.lastLatency),
                    this.timeoutTime
                );
                this.lastLatency = performance.now() - start;
                if (this.lastLatency > 1000) {
                    console.warn(`Ping took ${this.lastLatency / 1000} seconds.`);
                }
            } catch (e) {
                console.warn(`The server didn't respond to ping within ${this.timeoutTime / 1000} seconds.`);
                this.stopPing();
                // this.websocketService.simulateAbnormalClose();
            }
        }, this.intervalTime);
    }*/

    /**
     * Clears the ping interval
     */
    /*private stopPing(): void {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }*/
}
