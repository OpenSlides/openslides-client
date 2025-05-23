import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Content, ContentTable, TableCell } from 'pdfmake/interfaces';
import { HtmlToPdfService } from 'src/app/gateways/export/html-to-pdf.service';

import { ViewMotion } from '../../../view-models';
import { MotionControllerService } from '../../common/motion-controller.service';

/**
 * Creates a PDF list for amendments
 */
@Injectable({
    providedIn: `root`
})
export class AmendmentListPdfService {
    public constructor(
        private motionService: MotionControllerService,
        private translate: TranslateService,
        private htmlToPdfService: HtmlToPdfService
    ) {}

    /**
     * Also required by amendment-detail. Should be own service
     * @param amendment
     * @return rendered PDF text
     */
    private renderDiffLines(amendment: ViewMotion): Content[] {
        if (amendment.affectedAmendmentLines?.length) {
            const linesHtml = amendment.affectedAmendmentLines.map(line => line.text).join(`<br />[...]<br />`);
            return this.htmlToPdfService.convertHtml({ htmlText: linesHtml });
        }
        return [];
    }

    /**
     * Converts an amendment to a row of the `amendmentRows` table
     * @amendment the amendment to convert
     * @returns a line in the row as PDF doc definition
     */
    private amendmentToTableRow(amendment: ViewMotion): TableCell[] {
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
                text: amendment.submitterNames.toString()
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

    /**
     * Creates the PDFmake document structure for amendment list overview
     * @param docTitle the header
     * @param amendments the amendments to render
     */
    public overviewToDocDef(docTitle: string, amendments: ViewMotion[]): Content[] {
        const title = {
            text: docTitle,
            style: `title`
        };

        const amendmentTableBody: TableCell[][] = [
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

        const amendmentRows: TableCell[][] = [];
        for (const amendment of amendments) {
            amendmentRows.push(this.amendmentToTableRow(amendment));
        }

        const table: ContentTable = {
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
}
