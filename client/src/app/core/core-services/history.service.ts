import { Injectable } from '@angular/core';

import { BannerDefinition, BannerService } from '../ui-services/banner.service';

export class Position {
    public position: number;
    public timestamp: number;
    public information: string[];
    public user: string;

    public get date(): Date {
        return new Date(this.timestamp * 1000);
    }

    public constructor(input: Position) {
        if (input) {
            Object.assign(this, input);
        }
    }

    /**
     * Converts the date (this.now) to a time and date string.
     *
     * @param locale locale indicator, i.e 'de-DE'
     * @returns a human readable kind of time and date representation
     */
    public getLocaleString(locale: string): string {
        return this.date.toLocaleString(locale);
    }
}

/**
 * Holds information about OpenSlides. This is not included into other services to
 * avoid circular dependencies.
 */
@Injectable({
    providedIn: 'root'
})
export class HistoryService {
    /**
     * in History mode, saves the position
     */
    private position: Position = null;
    private bannerDefinition: BannerDefinition = {
        type: 'history'
    };

    /**
     * Returns, if OpenSlides is in the history mode.
     */
    public get isInHistoryMode(): boolean {
        return false; // Currently not supported
        // return !!this.position;
    }

    /**
     * Ctor, does nothing.
     */
    public constructor(private banner: BannerService) {}

    /**
     * Calls the getLocaleString function of the history object, if present.
     *
     * @param format the required date representation format
     * @returns the timestamp as string
     */
    public getHistoryTimeStamp(format: string): string {
        return this.position ? this.position.getLocaleString(format) : null;
    }

    /**
     * Enters the history mode
     */
    public enterHistoryMode(position: Position): void {
        throw new Error('The history mode is currently not supported');
        // this.position = position;
        // this.banner.addBanner(this.bannerDefinition);
    }

    /**
     * Leaves the history mode
     */
    public leaveHistoryMode(): void {
        throw new Error('The history mode is currently not supported');
        // this.position = null;
        // this.banner.removeBanner(this.bannerDefinition);
    }
}
