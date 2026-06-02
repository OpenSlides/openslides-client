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
    providedIn: `root`
})
export class LoadFontService {
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
        this.mediaManageService.getFontUrlObservable(`regular`).subscribe(url => {
            if (url) {
                this.setCustomProjectorFont(url);
            }
        });

        this.mediaManageService.getFontUrlObservable(`bold`).subscribe(url => {
            if (url) {
                this.setCustomProjectorFont(url, {
                    weight: `500`
                });
            }
        });

        this.mediaManageService.getFontUrlObservable(`bold_italic`).subscribe(url => {
            if (url) {
                this.setCustomProjectorFont(url, {
                    style: `italic`,
                    weight: `500`
                });
            }
        });

        this.mediaManageService.getFontUrlObservable(`italic`).subscribe(url => {
            if (url) {
                this.setCustomProjectorFont(url, {
                    style: `italic`
                });
            }
        });

        this.mediaManageService.getFontUrlObservable(`monospace`).subscribe(url => {
            if (url) {
                this.setNewFontFace(`OSFont Monospace`, url);
            }
        });

        this.mediaManageService.getFontUrlObservable(`chyron_speaker_name`).subscribe(url => {
            if (url) {
                this.setNewFontFace(`customChyronNameFont`, url);
            }
        });

        this.mediaManageService.getFontUrlObservable(`projector_h1`).subscribe(url => {
            if (url) {
                this.setNewFontFace(`OSFont projectorH1`, url);
            }
        });

        this.mediaManageService.getFontUrlObservable(`projector_h2`).subscribe(url => {
            if (url) {
                this.setNewFontFace(`OSFont projectorH2`, url);
            }
        });
    }

    /**
     * Sets a new font for the custom projector. Weight is required to
     * differentiate between bold and normal fonts
     *
     * @param fonturl the font object from the config service
     * @param weight the desired weight of the font
     */
    private setCustomProjectorFont(fonturl: string, descriptors?: FontFaceDescriptors): void {
        if (!fonturl) {
            return;
        }
        this.setNewFontFace(`customProjectorFont`, fonturl, descriptors);
    }

    private setNewFontFace(fontName: string, fontPath: string, descriptors?: FontFaceDescriptors): void {
        const customFont = new FontFace(fontName, `url(${fontPath})`, descriptors);
        customFont
            .load()
            .then((res: any) => {
                (document as FontDocument).fonts.add(res);
            })
            .catch((error: any) => {
                console.error(`Error setting font "${fontName}" with path "${fontPath}" :: `, error);
            });
    }
}
