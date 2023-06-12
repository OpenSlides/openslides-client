import { Injectable } from '@angular/core';

import { ExportServiceModule } from '../export-service.module';
import { HtmlToPdfService } from '../html-to-pdf.service';

/**
 * Adds OpenSlides-specific styles and code to its superclass HtmlToPdfService
 */
@Injectable({
    providedIn: ExportServiceModule
})
export class OpenslidesHtmlToPdfService extends HtmlToPdfService {
    public constructor() {
        super();
        this.registerElementStyles({
            h1: [`style:title`],
            h2: [`style:heading2`],
            h3: [`style:heading3`],
            h4: [`style:heading4`],
            h5: [`style:heading5`],
            h6: [`style:heading6`]
        });
    }
}
