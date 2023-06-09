import { Injectable } from '@angular/core';
import { distinctUntilChanged } from 'rxjs';
import { HtmlColor } from 'src/app/domain/definitions/key-types';
import { ThemeService } from 'src/app/site/services/theme.service';

import { ExportServiceModule } from '../export-service.module';
import { HtmlToPdfService } from '../html-to-pdf.service';

/**
 * Adds OpenSlides-specific styles and code to its superclass HtmlToPdfService
 */
@Injectable({
    providedIn: ExportServiceModule
})
export class OpenslidesHtmlToPdfService extends HtmlToPdfService {
    public constructor(private theme: ThemeService) {
        super();
        this.registerElementStyles({
            h1: this.calculateH1Style(),
            h2: this.addFontsToStyles(`font-size:13`),
            h3: this.addFontsToStyles(`font-size:10`, `font-weight:500`, `margin-bottom:0`),
            h4: this.addFontsToStyles(`font-size:9`, `font-weight:400`, `margin-bottom:5px`),
            h5: [`font-size:8`, `font-weight:bold`],
            h6: [`font-size:7`, `font-weight:bold`]
        });

        this.theme.currentPrimaryObservable.pipe(distinctUntilChanged()).subscribe(primary =>
            this.registerElementStyles({
                h1: this.calculateH1Style(primary)
            })
        );
    }

    private calculateH1Style(primaryColor: HtmlColor = ThemeService.DEFAULT_PRIMARY_COLOR): string[] {
        return this.addFontsToStyles(`font-size:16`, `color:${primaryColor}`, `padding-bottom:10px`, `margin:0`);
    }

    private addFontsToStyles(...styleArray: string[]): string[] {
        return [
            ...styleArray,
            `font-family:OSFont Condensed, Fira Sans Condensed, Roboto-condensed, Arial, Helvetica, sans-serif`
        ];
    }
}
