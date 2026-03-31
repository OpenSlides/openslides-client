import { Injectable } from '@angular/core';
import { TZDate } from '@date-fns/tz';

@Injectable({
    providedIn: `root`
})
export class TimeZoneService {
    public getTimeZone(): string {
        return 'Europe/Berlin';
    }

    public getAvailableTimeZones(): string[] {
        return Intl.supportedValuesOf('timeZone').filter(value => !value.startsWith(`Etc`));
    }

    public transformFromDate(value: Date, tz?: string): Date {
        const year = value.getFullYear();
        const month = value.getMonth();
        const day = value.getDate();
        const timezone = tz ?? 'UTC';
        return new TZDate(year, month, day, timezone);
    }

    public transformFromTS(value: number, tz?: string): Date {
        const timezone = tz ?? 'UTC';
        return new TZDate(value * 1000, timezone);
    }
}
