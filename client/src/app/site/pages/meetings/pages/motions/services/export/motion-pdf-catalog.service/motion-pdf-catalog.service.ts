import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Content } from 'pdfmake/interfaces';
import { MOTION_PDF_OPTIONS } from 'src/app/domain/models/motions/motions.constants';
import { BorderType, PdfError, StyleType } from 'src/app/gateways/export/pdf-document.service';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingPdfExportService } from 'src/app/site/pages/meetings/services/export';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { MotionCategoryControllerService } from '../../../modules/categories/services';
import { MotionControllerService } from '../../common/motion-controller.service';
import { MotionExportInfo } from '../motion-export.service';
import { MotionPdfService } from '../motion-pdf.service';
import { MotionsExportModule } from '../motions-export.module';

/**
 * Service to export a list of motions.
 *
 * @example
 * ```ts
 * const docDef = this.motionPdfCatalogService.motionListToDocDef(myListOfViewMotions);
 * ```
 */
@Injectable({
    providedIn: MotionsExportModule
})
export class MotionPdfCatalogService {
    public constructor(
        private translate: TranslateService,
        private motionPdfService: MotionPdfService,
        private pdfService: MeetingPdfExportService,
        private motionService: MotionControllerService,
        private categoryRepo: MotionCategoryControllerService,
        private meetingSettingsService: MeetingSettingsService
    ) {}

    /**
     * Converts the list of motions to pdfmake doc definition.
     * Public entry point to conversion of multiple motions
     *
     * @param motions the list of view motions to convert
     * @returns pdfmake doc definition as object
     */
    public motionListToDocDef(motions: ViewMotion[], exportInfo: MotionExportInfo): Content {
        let doc = [];
        const motionDocList = [];
        const printToc = exportInfo.pdfOptions?.includes(MOTION_PDF_OPTIONS.Toc);
        const hasContinuousText = exportInfo.pdfOptions?.includes(MOTION_PDF_OPTIONS.ContinuousText);
        // Do not enforce page breaks when continuous text is selected.
        const enforcePageBreaks = exportInfo.pdfOptions?.includes(MOTION_PDF_OPTIONS.AddBreaks) && !hasContinuousText;
        const onlyChangedLines = exportInfo.pdfOptions?.includes(MOTION_PDF_OPTIONS.OnlyChangedLines);

        for (let motionIndex = 0; motionIndex < motions.length; ++motionIndex) {
            let continuousText = hasContinuousText;
            if (motionIndex === 0) {
                continuousText = false;
            }

            try {
                const motionDocDef: any = this.motionPdfService.motionToDocDef({
                    motion: motions[motionIndex],
                    exportInfo: exportInfo,
                    continuousText: continuousText,
                    onlyChangedLines
                });

                // add id field to the first page of a motion to make it findable over TOC
                motionDocDef[0].id = `${motions[motionIndex].id}`;

                motionDocList.push(motionDocDef);

                if (motionIndex < motions.length - 1 && enforcePageBreaks) {
                    motionDocList.push(this.pdfService.getPageBreak());
                } else if (motionIndex < motions.length - 1 && !enforcePageBreaks) {
                    motionDocList.push(this.pdfService.getSpacer());
                }
            } catch (err) {
                const errorText = `${this.translate.instant(`Error during PDF creation of motion:`)} ${
                    motions[motionIndex].numberOrTitle
                }`;
                console.error(`${errorText}\nDebugInfo:\n`, err);
                throw new PdfError(errorText);
            }
        }

        // print extra data (title, preamble, categories, toc) only if there are more than 1 motion
        if (motions.length > 1 && (!exportInfo.pdfOptions || printToc) && !hasContinuousText) {
            doc.push(
                this.pdfService.createTitle(this.meetingSettingsService.instant(`motions_export_title`)!),
                this.pdfService.createPreamble(this.meetingSettingsService.instant(`motions_export_preamble`)),
                this.createToc(motions)
            );
        }

        doc = doc.concat(motionDocList);

        return doc;
    }

    /**
     * Creates the table of contents for the motion book.
     * Considers sorting by categories and no sorting.
     *
     * @param motions The motions to add in the TOC
     * @returns the table of contents as document definition
     */
    private createToc(motions: ViewMotion[]): Content {
        const toc = [];
        const categories = this.categoryRepo.getViewModelList();

        // Create the toc title
        const tocTitle = {
            text: this.translate.instant(`Table of contents`),
            style: `heading2`
        };
        const exportSubmitterRecommendation = this.meetingSettingsService.instant(
            `motions_export_submitter_recommendation`
        );

        // Initialize the header and the layout for border-style.
        const header = exportSubmitterRecommendation ? this.getTocHeaderDefinition() : undefined;
        const layout = exportSubmitterRecommendation ? BorderType.LIGHT_HORIZONTAL_LINES : BorderType.DEFAULT;

        if (categories && categories.length) {
            const catTocBody = [];
            // The categories are already sorted in the order in which they are needed.
            for (const category of categories) {
                // find out if the category has any motions
                const motionToCurrentCat = motions.filter(motionIn => category.id === motionIn.category_id);

                if (motionToCurrentCat && motionToCurrentCat.length) {
                    // if this is not the first page, start with a pagebreak
                    if (catTocBody.length) {
                        catTocBody.push(this.pdfService.getPageBreak());
                    }

                    catTocBody.push({
                        table: {
                            body: [
                                [
                                    {
                                        text: category.nameWithParentAbove,
                                        style: !!category.parent ? `tocSubcategoryTitle` : `tocCategoryTitle`
                                    }
                                ]
                            ]
                        },
                        layout: exportSubmitterRecommendation ? `lightHorizontalLines` : `noBorders`
                    });

                    const tocBody = [];
                    for (const motion of motionToCurrentCat) {
                        if (exportSubmitterRecommendation) {
                            tocBody.push(this.appendSubmittersAndRecommendation(motion, StyleType.CATEGORY_SECTION));
                        } else {
                            tocBody.push(
                                this.pdfService.createTocLine({
                                    identifier: `${motion.number ? motion.number : ``}`,
                                    title: motion.title,
                                    pageReference: `${motion.id}`,
                                    style: StyleType.CATEGORY_SECTION
                                })
                            );
                        }
                    }

                    catTocBody.push(
                        this.pdfService.createTocTableDef(
                            {
                                tocBody,
                                style: StyleType.CATEGORY_SECTION,
                                borderStyle: layout
                            },
                            header ? JSON.parse(JSON.stringify(header)) : null
                        )
                    );
                }
            }

            // handle those without category
            const uncatTocBody = motions
                .filter(motion => !motion.category)
                .map(motion =>
                    this.pdfService.createTocLine({
                        identifier: `${motion.number ? motion.number : ``}`,
                        title: motion.title,
                        pageReference: `${motion.id}`
                    })
                );

            // only push this array if there is at least one entry
            if (uncatTocBody.length > 0) {
                catTocBody.push(this.pdfService.getPageBreak());
                catTocBody.push(
                    this.pdfService.createTocTableDef({ tocBody: uncatTocBody, style: StyleType.CATEGORY_SECTION })
                );
            }

            toc.push(catTocBody);
        } else {
            // all motions in the same table
            const tocBody = [];
            for (const motion of motions) {
                if (exportSubmitterRecommendation) {
                    tocBody.push(this.appendSubmittersAndRecommendation(motion));
                } else {
                    tocBody.push(
                        this.pdfService.createTocLine({
                            identifier: `${motion.number ? motion.number : ``}`,
                            title: motion.title,
                            pageReference: `${motion.id}`
                        })
                    );
                }
            }
            toc.push(
                this.pdfService.createTocTableDef(
                    { tocBody, style: StyleType.CATEGORY_SECTION, borderStyle: layout },
                    header
                )
            );
        }

        return [tocTitle, toc, this.pdfService.getPageBreak()];
    }

    /**
     * Function to get the definition for the header
     * for exporting motion-list as PDF. Needed, if submitters
     * and recommendation should also be exported to the `Table of contents`.
     *
     * @returns {Content} The DocDefinition for `pdfmake.js`.
     */
    private getTocHeaderDefinition(): Content {
        return [
            { text: this.translate.instant(`Number`), style: `tocHeaderRow` },
            {
                style: `tocHeaderRow`,
                text: [
                    `${this.translate.instant(`Title`)} · ${this.translate.instant(`Submitters`)} · `,
                    { text: `${this.translate.instant(`Recommendation`)}`, italics: true }
                ]
            },
            { text: this.translate.instant(`Page`), style: `tocHeaderRow`, alignment: `right` }
        ];
    }

    /**
     * Creates lines for the `Table of contents` containing submitters and recommendation.
     *
     * @param motion The motion containing the information
     * @param style Optional `StyleType`. Defaults to `tocEntry`.
     *
     * @returns {Array<Content>} An array containing the `DocDefinitions` for `pdf-make`.
     */
    private appendSubmittersAndRecommendation(motion: ViewMotion, style: StyleType = StyleType.DEFAULT): Content[] {
        let submitterList = ``;
        let state = ``;
        if (motion.state!.isFinalState) {
            state = this.motionService.getExtendedStateLabel(motion);
        } else {
            state = this.motionService.getExtendedRecommendationLabel(motion);
        }
        for (let i = 0; i < motion.submitters.length; ++i) {
            submitterList +=
                i !== motion.submitters.length - 1
                    ? motion.submitters[i].getTitle() + `, `
                    : motion.submitters[i].getTitle();
        }
        return this.pdfService.createTocLine(
            {
                identifier: `${motion.number ? motion.number : ``}`,
                title: motion.title,
                pageReference: `${motion.id}`,
                style
            },
            this.pdfService.createTocLineInline(submitterList),
            this.pdfService.createTocLineInline(state, true)
        );
    }
}
