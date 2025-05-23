import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ServerTimeService } from 'src/app/gateways/server-time.service';

@Component({
    selector: `os-projector-clock`,
    templateUrl: `./projector-clock.component.html`,
    styleUrls: [`./projector-clock.component.scss`],
    standalone: false
})
export class ProjectorClockComponent implements OnInit, OnDestroy {
    @Input()
    public color = ``;

    public time = ``;

    private servertimeSubscription: Subscription | null = null;

    private clockInterval: any;

    public constructor(private servertimeService: ServerTimeService) {}

    public ngOnInit(): void {
        // Update clock, when the server offset changes.
        this.servertimeSubscription = this.servertimeService
            .getServerOffsetObservable()
            .subscribe(() => this.updateClock());

        // Update clock every 10 seconds.
        this.clockInterval = setInterval(() => this.updateClock(), 10 * 1000);
    }

    private updateClock(): void {
        const time = new Date(this.servertimeService.getServertime());
        const hours = `0` + time.getHours();
        const minutes = `0` + time.getMinutes();

        // Will display time in hh:mm format
        this.time = hours.slice(-2) + `:` + minutes.slice(-2);
    }

    public ngOnDestroy(): void {
        if (this.servertimeSubscription) {
            this.servertimeSubscription.unsubscribe();
        }
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
    }
}
