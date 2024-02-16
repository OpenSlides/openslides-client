import { Inject, Injectable, Optional } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import { TranslateService } from '@ngx-translate/core';
import { langToTimeLocale } from 'src/app/infrastructure/utils';

/**
 * A custom DateAdapter for the datetimepicker in the config. Uses MomentDateAdapter for localisation.
 * Is needed to subscribe to language changes
 */
@Injectable()
export class OpenSlidesDateAdapter extends DateFnsAdapter {
    public constructor(protected translate: TranslateService, @Optional() @Inject(MAT_DATE_LOCALE) dateLocale: string) {
        super(dateLocale);
        // subscribe to language changes to change localisation of dates accordingly
        // DateAdapter seems not to be a singleton so we do that in this subclass instead of app.component
        this.updateLocaleByName(translate.currentLang);
        translate.onLangChange.subscribe(() => {
            this.updateLocaleByName(translate.currentLang);
        });
    }

    private async updateLocaleByName(name: string): Promise<void> {
        this.setLocale(await langToTimeLocale(name));
    }

    // -------------------------------------------------------
    // NgxMatDateAdapter port for NgxMatDatetimePicker support
    // -------------------------------------------------------
    public getHour(date: Date): number {
        return date.getHours();
    }

    public getMinute(date: Date): number {
        return date.getMinutes();
    }

    public getSecond(date: Date): number {
        return date.getSeconds();
    }

    public setHour(date: Date, value: number): void {
        date.setHours(value);
    }

    public setMinute(date: Date, value: number): void {
        date.setMinutes(value);
    }

    public setSecond(date: Date, value: number): void {
        date.setSeconds(value);
    }

    public isSameTime(a: Date, b: Date): boolean {
        if (a == null || b == null) return true;
        return (
            this.getHour(a) === this.getHour(b) &&
            this.getMinute(a) === this.getMinute(b) &&
            this.getSecond(a) === this.getSecond(b)
        );
    }

    public copyTime(toDate: Date, fromDate: Date): void {
        this.setHour(toDate, this.getHour(fromDate));
        this.setMinute(toDate, this.getMinute(fromDate));
        this.setSecond(toDate, this.getSecond(fromDate));
    }

    public compareDateWithTime(first: Date, second: Date, showSeconds?: boolean): number {
        let res =
            super.compareDate(first, second) ||
            this.getHour(first) - this.getHour(second) ||
            this.getMinute(first) - this.getMinute(second);
        if (showSeconds) {
            res = res || this.getSecond(first) - this.getSecond(second);
        }
        return res;
    }

    public setTimeByDefaultValues(date: Date, defaultTime: number[]): void {
        if (!Array.isArray(defaultTime)) {
            throw Error(`@Input DefaultTime should be an array`);
        }
        this.setHour(date, defaultTime[0] || 0);
        this.setMinute(date, defaultTime[1] || 0);
        this.setSecond(date, defaultTime[2] || 0);
    }
}
