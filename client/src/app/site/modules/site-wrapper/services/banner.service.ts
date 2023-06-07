import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Constructable } from 'src/app/domain/interfaces/constructable';

export class BannerDefinition {
    type?: string;
    class?: string;
    icon?: string;
    text?: string;
    subText?: string;
    link?: string;
    largerOnMobileView?: boolean;
    component?: Constructable;
}

@Injectable({
    providedIn: `root`
})
export class BannerService {
    private get currentBanners(): BannerDefinition[] {
        return this._activeBanners.value;
    }

    private readonly _activeBanners: BehaviorSubject<BannerDefinition[]> = new BehaviorSubject<BannerDefinition[]>([]);

    public getActiveBannersObservable(): Observable<BannerDefinition[]> {
        return this._activeBanners;
    }

    /**
     * Adds a banner to the list of active banners. Skip the banner if it's already in the list
     * @param toAdd the banner to add
     */
    public addBanner(toAdd: BannerDefinition): void {
        if (!this.currentBanners.find(banner => JSON.stringify(banner) === JSON.stringify(toAdd))) {
            this._activeBanners.next(this.currentBanners.concat([toAdd]));
        }
    }

    /**
     * Replaces a banner with another. Convenience method to prevent flickering
     * @param toAdd the banner to add
     * @param toRemove the banner to remove
     */
    public replaceBanner(toRemove: BannerDefinition, toAdd: BannerDefinition): void {
        if (toRemove) {
            const newArray = Array.from(this.currentBanners);
            const idx = newArray.findIndex(banner => banner === toRemove);
            if (idx === -1) {
                throw new Error(`The given banner couldn't be found.`);
            } else {
                newArray[idx] = toAdd;
                this._activeBanners.next(newArray); // no need for this.update since the length doesn't change
            }
        } else {
            this.addBanner(toAdd);
        }
    }

    /**
     * removes the given banner
     * @param toRemove the banner to remove
     */
    public removeBanner(toRemove: BannerDefinition): void {
        if (toRemove) {
            const newBanners = this.currentBanners.filter(
                banner => JSON.stringify(banner) !== JSON.stringify(toRemove)
            );
            this._activeBanners.next(newBanners);
        }
    }
}
