import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { ServerTimePresenterService } from 'src/app/gateways/presenter/server-time-presenter.service';

interface CountdownData {
    running: boolean;
    default_time?: number;
    countdown_time: number;
}

export enum CountdownState {
    RESET = 0,
    STARTED = 1,
    STOPPED = 2
}

@Component({
    selector: `os-countdown-time`,
    templateUrl: `./countdown-time.component.html`,
    styleUrls: [`./countdown-time.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CountdownTimeComponent implements OnDestroy {
    /**
     * The time in seconds to make the countdown orange, if the countdown is below this value.
     */
    @Input()
    public warningTime!: number;

    /**
     * Boolean, whether the countdown will be displayed in a fullscreen-mode.
     */
    @Input()
    public fullscreen = false;

    @Input()
    public unstyled = false;

    /**
     * The needed data for the countdown.
     */
    @Input()
    public set countdown(data: CountdownData) {
        this._countdown = data;
        if (this._countdownInterval) {
            clearInterval(this._countdownInterval);
        }

        if (data) {
            this.updateCountdownTime();
            this._countdownInterval = setInterval(() => this.updateCountdownTime(), 500);
        }
    }

    public get countdown(): CountdownData {
        return this._countdown;
    }

    public get state(): CountdownState {
        if (!this._countdown.running) {
            if (this._countdown.countdown_time === this._countdown.default_time) {
                return CountdownState.RESET;
            } else if (this._countdown.countdown_time !== this._countdown.default_time) {
                return CountdownState.STOPPED;
            }
        }

        return CountdownState.STARTED;
    }

    public get secondsRemaining(): number {
        const factor = this._countdown.default_time === 0 ? -1 : 1;
        if (this._countdown.running) {
            return Math.floor(this.countdown.countdown_time - this.servertimeService.getServertime() / 1000) * factor;
        }

        return this._countdown.countdown_time * factor;
    }

    /**
     * Passing a specific display-type will decide, whether either only the time-indicator
     * or only the countdown or both of them are displayed.
     *
     * @param displayType A string, that contains the preferred display-type.
     */
    @Input()
    public set displayType(displayType: string) {
        if (!displayType) {
            displayType = `onlyCountdown`;
        }
        this.showTimeIndicator = displayType === `countdownAndTimeIndicator` || displayType === `onlyTimeIndicator`;
        this.showCountdown = displayType === `onlyCountdown` || displayType === `countdownAndTimeIndicator`;
    }

    /**
     * Boolean to decide, if the time-indicator should be displayed.
     * Defaults to `false`.
     */
    public showTimeIndicator = false;

    /**
     * Boolean to decide, if the countdown should be displayed.
     * Defaults to `true`.
     */
    public showCountdown = true;

    /**
     * The amount of seconds to display
     */
    public seconds!: number;

    /**
     * String formattet seconds.
     */
    public time!: string;

    /**
     * The updateinterval.
     */
    private _countdownInterval: NodeJS.Timeout | null = null;

    private _countdown!: CountdownData;

    public constructor(private servertimeService: ServerTimePresenterService, private cd: ChangeDetectorRef) {}

    /**
     * Clear all pending intervals.
     */
    public ngOnDestroy(): void {
        if (this._countdownInterval) {
            clearInterval(this._countdownInterval);
        }
    }

    /**
     * Updates the countdown time and string format it.
     */
    private updateCountdownTime(): void {
        this.seconds = this.secondsRemaining;

        const negative = this.seconds < 0;
        let seconds = this.seconds;
        if (negative) {
            seconds = -seconds;
        }

        const time = new Date(seconds * 1000);
        const m = Math.floor(+time / 1000 / 60).toString();
        const s = `0` + time.getSeconds();

        this.time = (m.length < 2 ? `0` : ``) + m + `:` + s.slice(-2);

        if (negative) {
            this.time = `-` + this.time;
        }
        this.cd.markForCheck();
    }
}
