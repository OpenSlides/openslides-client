import { Injectable } from '@angular/core';

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
}
