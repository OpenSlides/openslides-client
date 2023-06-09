import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ViewMotion } from '../../../view-models';
import { MotionControllerService } from '../../common/motion-controller.service';
import { MotionHtmlToPdfService } from '../motion-html-to-pdf.service';
import { MotionsExportModule } from '../motions-export.module';

/**
 * Creates a PDF list for amendments
 */
@Injectable({
    providedIn: MotionsExportModule
})
export class AmendmentListPdfService {
    public constructor(
        private motionService: MotionControllerService,
        private translate: TranslateService,
        private htmlToPdfService: MotionHtmlToPdfService
    ) {}

    /**
     * Creates the PDFmake document structure for amendment list overview
     * @param docTitle the header
     * @param amendments the amendments to render
     */
    public overviewToDocDef(docTitle: string, amendments: ViewMotion[]): object {
        const title = {
            text: docTitle,
            style: `title`
        };

        const amendmentTableBody: object[] = [
            [
                {
                    text: this.translate.instant(`Motion`),
                    style: `tableHeader`
                },
                {
                    text: this.translate.instant(`Line`),
                    style: `tableHeader`
                },
                {
                    text: this.translate.instant(`Submitters`),
                    style: `tableHeader`
                },
                {
                    text: this.translate.instant(`Changes`),
                    style: `tableHeader`
                },
                {
                    text: this.translate.instant(`Recommendation`),
                    style: `tableHeader`
                }
            ]
        ];

        const amendmentRows: object[] = [];
        for (const amendment of amendments) {
            amendmentRows.push(this.amendmentToTableRow(amendment));
        }

        const table: object = {
            table: {
                widths: [`auto`, `auto`, `auto`, `*`, `auto`],
                headerRows: 1,
                dontBreakRows: true,
                body: amendmentTableBody.concat(amendmentRows)
            },
            layout: `switchColorTableLayout`
        };

        return [title, table];
    }

    /**
     * Also required by amendment-detail. Should be own service
     * @param amendment
     * @return rendered PDF text
     */
    private renderDiffLines(amendment: ViewMotion): object {
        if (amendment.affectedAmendmentLines?.length) {
            const linesHtml = amendment.affectedAmendmentLines.map(line => line.text).join(`<br />[...]<br />`);
            return this.htmlToPdfService.convertHtml({ htmlText: linesHtml });
        }
        return {};
    }

    /**
     * Converts an amendment to a row of the `amendmentRows` table
     * @amendment the amendment to convert
     * @returns a line in the row as PDF doc definition
     */
    private amendmentToTableRow(amendment: ViewMotion): object {
        let recommendationText = ``;
        if (amendment.recommendation) {
            if (amendment.recommendation.show_recommendation_extension_field && amendment.recommendationExtension) {
                recommendationText += ` ${this.motionService.getExtendedRecommendationLabel(amendment)}`;
            } else {
                recommendationText += amendment.recommendation.recommendation_label;
            }
        }

        return [
            {
                text: amendment.numberOrTitle
            },
            {
                text: amendment.getChangedLines()
            },
            {
                text: amendment.submittersAsUsers.toString()
            },
            {
                // requires stack cause this can be an array
                stack: this.renderDiffLines(amendment)
            },
            {
                text: recommendationText
            }
        ];
    }
}
