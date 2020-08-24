import { Injectable } from '@angular/core';

import { MediaManageService } from './media-manage.service';

/**
 * Enables the usage of the FontFace constructor
 */
declare let FontFace: any;

/**
 * The linter refuses to allow Document['fonts'].
 * Since Document.fonts is working draft since 2016, typescript
 * dies not yet support it natively (even though it exists in normal browsers)
 */
interface FontDocument extends Document {
    fonts: any;
}

/**
 * Service to dynamically load and sets custom loaded fonts
 * using FontFace.
 * Browser support might not be perfect yet.
 */
@Injectable({
    providedIn: 'root'
})
export class LoadFontService {
    /**
     * The prefix to load custom fonts from
     */
    private urlPrefix = window.location.origin;

    public constructor(private mediaManageService: MediaManageService) {
        this.loadCustomFont();
    }

    /**
     * Observes and loads custom fonts for the projector.
     * Currently, normal and regular fonts can be considered, since
     * italic fonts can easily be calculated by the browser.
     * Falls back to the normal OSFont when no custom  font was set.
     */
    private loadCustomFont(): void {
        this.mediaManageService.getFontUrlObservable('regular').subscribe(url => {
            if (url) {
                this.setCustomProjectorFont(url, 400);
            }
        });

        this.mediaManageService.getFontUrlObservable('bold').subscribe(url => {
            if (url) {
                this.setCustomProjectorFont(url, 500);
            }
        });
    }

    /**
     * Sets a new font for the custom projector. Weight is required to
     * differentiate between bold and normal fonts
     *
     * @param url the font url
     * @param weight the desired weight of the font
     */
    private setCustomProjectorFont(url: string, weight: number): void {
        const fontFace = new FontFace('customProjectorFont', `url(${url})`, { weight: weight });
        fontFace
            .load()
            .then(res => {
                (document as FontDocument).fonts.add(res);
            })
            .catch(error => {
                console.error(error);
            });
    }
}
