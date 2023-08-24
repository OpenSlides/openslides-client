import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
    ChangeRecoMode,
    LineNumberingMode,
    MOTION_PDF_OPTIONS,
    PERSONAL_NOTE_ID
} from 'src/app/domain/models/motions/motions.constants';
import { VOTE_UNDOCUMENTED } from 'src/app/domain/models/poll';
import { PdfImagesService } from 'src/app/gateways/export/pdf-document.service/pdf-images.service';
import { PollKeyVerbosePipe, PollParseNumberPipe } from 'src/app/site/pages/meetings/modules/poll/pipes';
import { ViewMotion, ViewMotionChangeRecommendation } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingPdfExportService } from 'src/app/site/pages/meetings/services/export';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';

import { getRecommendationTypeName } from '../../../definitions';
import { ViewUnifiedChangeType } from '../../../modules';
import { MotionChangeRecommendationControllerService } from '../../../modules/change-recommendations/services';
import { LineNumberingService } from '../../../modules/change-recommendations/services';
import { MotionCommentSectionControllerService } from '../../../modules/comments/services';
import { MotionPollService } from '../../../modules/motion-poll/services';
import { MotionStatuteParagraphControllerService } from '../../../modules/statute-paragraphs/services';
import { ViewMotionAmendedParagraph } from '../../../view-models/view-motion-amended-paragraph';
import { MotionControllerService } from '../../common/motion-controller.service';
import { MotionFormatService } from '../../common/motion-format.service';
import { MotionLineNumberingService } from '../../common/motion-line-numbering.service';
import { InfoToExport } from '../definitions';
import { MotionExportInfo } from '../motion-export.service';
import { MotionHtmlToPdfService } from '../motion-html-to-pdf.service';
import { MotionsExportModule } from '../motions-export.module';

interface CreateTextData {
    motion: ViewMotion;
    lineLength: number;
    lnMode: LineNumberingMode;
    crMode: ChangeRecoMode;
    lineHeight: number;
}

interface MotionToDocDefData {
    motion: ViewMotion;
    exportInfo?: MotionExportInfo;
    continuousText?: boolean;
}

/**
 * The total width of the exported PDF in points.
 * Is needed to calculate the width of the images in the attachment.
 *
 * The values are calculated from the width of the page in inches.
 *
 * A4/A5-width-in-inch x 72 = points;
 *
 * A4: 8.268in x 72 = 595.296
 * A5: 5.827in x 72 = 419.544
 */
const PDF_A4_POINTS_WIDTH = 595.296;
const PDF_A5_POINTS_WIDTH = 419.544;

/**
 * Converts a motion to pdf. Can be used from the motion detail view or executed on a list of motions
 * Provides the public method `motionToDocDef(motion: Motion)` which should be convenient to use.
 * `motionToDocDef(... )` accepts line numbering mode and change recommendation mode as optional parameter.
 * If not present, the default parameters will be read from the config.
 *
 * @example
 * ```ts
 * const pdfMakeCompatibleDocDef = this.MotionPdfService.motionToDocDef(myMotion);
 * ```
 */
@Injectable({
    providedIn: MotionsExportModule
})
export class MotionPdfService {
    public constructor(
        private translate: TranslateService,
        private motionService: MotionControllerService,
        private motionLineNumbering: MotionLineNumberingService,
        private statuteRepo: MotionStatuteParagraphControllerService,
        private changeRecoRepo: MotionChangeRecommendationControllerService,
        private meetingSettingsService: MeetingSettingsService,
        private pdfDocumentService: MeetingPdfExportService,
        private htmlToPdfService: MotionHtmlToPdfService,
        private linenumberingService: LineNumberingService,
        private commentRepo: MotionCommentSectionControllerService,
        private pollKeyVerbose: PollKeyVerbosePipe,
        private parsePollNumber: PollParseNumberPipe,
        private organizationSettingsService: OrganizationSettingsService,
        private motionPollService: MotionPollService,
        private motionFormatService: MotionFormatService,
        private pdfImagesService: PdfImagesService
    ) {}

    /**
     * Converts a motion to PdfMake doc definition
     *
     * @param motion the motion to convert to pdf
     * @returns doc def for the motion
     */
    public motionToDocDef({ motion, continuousText, exportInfo }: MotionToDocDefData): object {
        let lnMode = exportInfo && exportInfo.lnMode ? exportInfo.lnMode : null;
        let crMode = exportInfo && exportInfo.crMode ? exportInfo.crMode : null;
        const infoToExport = exportInfo ? exportInfo.metaInfo : null;
        const contentToExport = exportInfo ? exportInfo.content : null;
        let commentsToExport = exportInfo ? exportInfo.comments : null;

        // get the line length from the config
        const lineLength = this.meetingSettingsService.instant(`motions_line_length`) as number;
        // whether to append checkboxes to follow the recommendation or not
        const optionToFollowRecommendation = this.meetingSettingsService.instant(
            `motions_export_follow_recommendation`
        )!;

        let motionPdfContent: any[] = [];

        // Enforces that statutes should always have Diff Mode and no line numbers
        if (motion.isStatuteAmendment()) {
            lnMode = LineNumberingMode.None;
            crMode = ChangeRecoMode.Diff;
        }

        // determine the default lnMode if not explicitly given
        if (!lnMode) {
            lnMode = this.meetingSettingsService.instant(`motions_default_line_numbering`)!;
        }

        // determine the default crMode if not explicitly given
        if (!crMode) {
            crMode = this.meetingSettingsService.instant(`motions_recommendation_text_mode`)!;
        }
        if (!continuousText) {
            const title = this.createTitle(motion, crMode, lineLength);
            const sequential =
                infoToExport?.includes(`sequential_number`) ??
                (this.meetingSettingsService.instant(`motions_show_sequential_number`) as boolean);
            const subtitle = this.createSubtitle(motion, sequential);

            motionPdfContent = [title, subtitle];
        }
        if (((infoToExport && infoToExport.length > 0) || !infoToExport) && !continuousText) {
            const metaInfo = this.createMetaInfoTable(
                motion,
                lineLength,
                crMode,
                infoToExport,
                optionToFollowRecommendation
            );
            motionPdfContent.push(metaInfo);
        }

        if (!contentToExport || contentToExport.includes(`text`)) {
            if (motion.showPreamble && !continuousText) {
                const preamble = this.createPreamble();
                motionPdfContent.push(preamble);
            }
            const lineHeight = this.meetingSettingsService.instant(`export_pdf_line_height`)!;
            const text = this.createText({
                motion,
                lineLength,
                lnMode,
                crMode,
                lineHeight
            });
            motionPdfContent.push(text);
        }

        if (!contentToExport || contentToExport.includes(`reason`)) {
            const reason = this.createReason(motion);
            motionPdfContent.push(reason);
        }

        if (
            exportInfo &&
            exportInfo.pdfOptions &&
            exportInfo.pdfOptions.includes(MOTION_PDF_OPTIONS.Attachments) &&
            motion.attachments.length > 0
        ) {
            motionPdfContent.push(this.createAttachments(motion));
        }

        if (infoToExport && infoToExport.includes(`allcomments`)) {
            commentsToExport = this.commentRepo.getViewModelList().map(vm => vm.id);
        }
        if (commentsToExport) {
            motionPdfContent.push(this.createComments(motion, commentsToExport));
        }

        return motionPdfContent;
    }

    /**
     * Create the motion title part of the doc definition
     *
     * @param motion the target motion
     * @param crMode the change recommendation mode
     * @param lineLength the line length
     * @returns doc def for the document title
     */
    private createTitle(motion: ViewMotion, crMode: ChangeRecoMode, lineLength: number): object {
        // summary of change recommendations (for motion diff version only)
        const changes = this.motionFormatService.getUnifiedChanges(motion, lineLength);
        const titleChange = changes.find(change => change?.isTitleChange())!;
        const changedTitle = this.changeRecoRepo.getTitleWithChanges(motion.title, titleChange, crMode);

        const number = motion.number ? motion.number : ``;
        let title = ``;
        if (this.pdfDocumentService.pageSize === `A4`) {
            title += `${this.translate.instant(`Motion`)} `;
        }

        title += `${number}: ${changedTitle}`;

        return {
            text: title,
            style: `title`
        };
    }

    /**
     * Create the motion subtitle and sequential number part of the doc definition
     *
     * @param motion the target motion
     * @param sequential set to true to include the sequential number
     * @returns doc def for the subtitle
     */
    private createSubtitle(motion: ViewMotion, sequential?: boolean): object {
        const subtitleLines = [];
        if (sequential) {
            subtitleLines.push(`${this.translate.instant(`Sequential number`)}: ${motion.sequential_number}`);
        }

        if (motion.lead_motion) {
            if (sequential) {
                subtitleLines.push(` • `);
            }
            subtitleLines.push(
                `${this.translate.instant(`Amendment to`)} ${motion.lead_motion.number || motion.lead_motion.title}`
            );
        }

        return {
            text: subtitleLines,
            style: `subtitle`
        };
    }

    /**
     * Creates the MetaInfoTable
     *
     * @param motion the target motion
     * @returns doc def for the meta infos
     */
    private createMetaInfoTable(
        motion: ViewMotion,
        lineLength: number,
        crMode: ChangeRecoMode,
        infoToExport: InfoToExport[] | null | undefined,
        optionToFollowRecommendation?: boolean
    ): object {
        const metaTableBody = [];

        // submitters
        if (!infoToExport || infoToExport.includes(`submitters`)) {
            const submitters = motion.submittersAsUsers.map(user => user.full_name).join(`, `);

            metaTableBody.push([
                {
                    text: `${this.translate.instant(`Submitters`)}:`,
                    style: `boldText`
                },
                {
                    text: submitters
                }
            ]);
        }

        // supporters
        if (!infoToExport || infoToExport.includes(`supporter_users`)) {
            const minSupporters = this.meetingSettingsService.instant(`motions_supporters_min_amount`);
            if (minSupporters && motion.supporter_users.length > 0) {
                const supporters = motion.supporter_users.map(supporter => supporter.full_name).join(`, `);

                metaTableBody.push([
                    {
                        text: `${this.translate.instant(`Supporters`)}:`,
                        style: `boldText`
                    },
                    {
                        text: supporters
                    }
                ]);
            }
        }

        // state
        if (!infoToExport || infoToExport.includes(`state`)) {
            metaTableBody.push([
                {
                    text: `${this.translate.instant(`State`)}:`,
                    style: `boldText`
                },
                {
                    text: this.motionService.getExtendedStateLabel(motion)
                }
            ]);
        }

        // recommendation
        if (motion.recommendation && (!infoToExport || infoToExport.includes(`recommendation`))) {
            let recommendationByText: string;

            if (motion.isStatuteAmendment()) {
                recommendationByText = this.meetingSettingsService.instant(`motions_statute_recommendations_by`)!;
            } else {
                recommendationByText = this.meetingSettingsService.instant(`motions_recommendations_by`)!;
            }

            metaTableBody.push([
                {
                    text: `${recommendationByText}:`,
                    style: `boldText`
                },
                {
                    text: this.motionService.getExtendedRecommendationLabel(motion)
                }
            ]);
        }

        // referring motions
        if (!infoToExport || infoToExport.includes(`referring_motions`)) {
            if (motion.referenced_in_motion_recommendation_extensions.length) {
                const referringMotions = motion.referenced_in_motion_recommendation_extensions
                    .sort((a, b) =>
                        a.number
                            ? b.number
                                ? a.number.localeCompare(b.number)
                                : -1
                            : b.number
                            ? 1
                            : a.title.localeCompare(b.title)
                    )
                    .map(motion => motion.getNumberOrTitle())
                    .join(`, `);

                metaTableBody.push([
                    {
                        text: `${this.translate.instant(`Referring motions`)}:`,
                        style: `boldText`
                    },
                    {
                        text: referringMotions
                    }
                ]);
            }
        }

        // category
        if (motion.category && (!infoToExport || infoToExport.includes(`category`))) {
            let categoryText = ``;
            if (motion.category.parent) {
                categoryText = `${motion.category.parent.toString()}\n${this.translate.instant(
                    `Subcategory`
                )}: ${motion.category.toString()}`;
            } else {
                categoryText = motion.category.toString();
            }
            metaTableBody.push([
                {
                    text: `${this.translate.instant(`Category`)}:`,
                    style: `boldText`
                },
                {
                    text: categoryText
                }
            ]);
        }

        // tags
        if (motion.tags.length && (!infoToExport || infoToExport.includes(`tags`))) {
            const tags = motion.tags.map(tag => tag).join(`, `);

            metaTableBody.push([
                {
                    text: `${this.translate.instant(`Tags`)}:`,
                    style: `boldText`
                },
                {
                    text: tags
                }
            ]);
        }

        // motion block
        if (motion.block && (!infoToExport || infoToExport.includes(`block`))) {
            metaTableBody.push([
                {
                    text: `${this.translate.instant(`Motion block`)}:`,
                    style: `boldText`
                },
                {
                    text: motion.block.title
                }
            ]);
        }

        // voting results
        if (motion.polls.length && (!infoToExport || infoToExport.includes(`polls`))) {
            motion.polls.forEach(poll => {
                if (poll.hasVotes) {
                    const tableData = this.motionPollService.generateTableData(poll);
                    const column1: any[] = [];
                    const column2: any[] = [];
                    const column3: any[] = [];
                    tableData.forEach(votingResult => {
                        const votingOption = this.translate.instant(
                            this.pollKeyVerbose.transform(votingResult.votingOption)
                        );
                        const value = votingResult.value[0];
                        if (value.amount !== VOTE_UNDOCUMENTED) {
                            const resultValue = this.parsePollNumber.transform(value.amount!);
                            column1.push(`${votingOption}:`);
                            if (value.showPercent) {
                                const resultInPercent = this.motionPollService.getVoteValueInPercent(value.amount!, {
                                    poll
                                });
                                // hard check for "null" since 0 is a valid number in this case
                                if (resultInPercent !== null) {
                                    column2.push(`(${resultInPercent})`);
                                } else {
                                    column2.push(``);
                                }
                            } else {
                                column2.push(``);
                            }
                            column3.push(resultValue);
                        }
                    });
                    metaTableBody.push([
                        {
                            text: poll.title,
                            style: `boldText`
                        },
                        {
                            columns: [
                                {
                                    text: column1.join(`\n`),
                                    width: `auto`
                                },
                                {
                                    text: column2.join(`\n`),
                                    width: `auto`,
                                    alignment: `right`
                                },
                                {
                                    text: column3.join(`\n`),
                                    width: `auto`,
                                    alignment: `right`
                                }
                            ],
                            columnGap: 7
                        }
                    ]);
                }
            });
        }

        // summary of change recommendations (for motion diff version only)
        const changes = this.motionFormatService.getUnifiedChanges(motion, lineLength);

        if (crMode === ChangeRecoMode.Diff && changes.length > 0) {
            const columnLineNumbers: any[] = [];
            const columnChangeType: any[] = [];

            changes.forEach(change => {
                if (change.isTitleChange()) {
                    // Is always a change recommendation
                    const changeReco = change as ViewMotionChangeRecommendation;
                    columnLineNumbers.push(`${this.translate.instant(`Title`)}: `);
                    columnChangeType.push(
                        `(${this.translate.instant(`Change recommendation`)}) - ${this.translate.instant(
                            getRecommendationTypeName(changeReco)
                        )}`
                    );
                } else {
                    // line numbers column
                    let line: string;
                    if (change.getLineFrom() === change.getLineTo()) {
                        line = change.getLineFrom().toString();
                    } else {
                        line = change.getLineFrom() + ` - ` + change.getLineTo();
                    }

                    // change type column
                    if (change.getChangeType() === ViewUnifiedChangeType.TYPE_CHANGE_RECOMMENDATION) {
                        const changeReco = change as ViewMotionChangeRecommendation;
                        columnLineNumbers.push(`${this.translate.instant(`Line`)} ${line} `);
                        columnChangeType.push(
                            `(${this.translate.instant(`Change recommendation`)}) - ${this.translate.instant(
                                getRecommendationTypeName(changeReco)
                            )}`
                        );
                    } else if (change.getChangeType() === ViewUnifiedChangeType.TYPE_AMENDMENT) {
                        const amendment = change as ViewMotionAmendedParagraph;
                        let summaryText = `(${this.translate.instant(`Amendment`)} ${amendment.getNumber()}) -`;
                        if (amendment.isRejected()) {
                            summaryText += ` ${this.translate.instant(`Rejected`)}`;
                        } else if (amendment.isAccepted()) {
                            summaryText += ` ${this.translate.instant(amendment.stateName)}`;
                            // only append line and change, if the merge of the state of the amendment is accepted.
                            columnLineNumbers.push(`${this.translate.instant(`Line`)} ${line} `);
                            columnChangeType.push(summaryText);
                        }
                    }
                }
            });

            if (columnChangeType.length > 0) {
                metaTableBody.push([
                    {
                        text: this.translate.instant(`Summary of changes:`),
                        style: `boldText`
                    },
                    {
                        columns: [
                            {
                                text: columnLineNumbers.join(`\n`),
                                width: `auto`
                            },
                            {
                                text: columnChangeType.join(`\n`),
                                width: `auto`
                            }
                        ],
                        columnGap: 7
                    }
                ]);
            }
        }

        // Checkboxes for resolution
        if (optionToFollowRecommendation && !motion.state.isFinalState) {
            metaTableBody.push([
                {
                    text: `${this.translate.instant(`Decision`)}:`,
                    style: `boldText`
                },
                {
                    margin: [5, 2, 0, 2],
                    columns: [
                        {
                            width: 8,
                            canvas: this.pdfDocumentService.drawCircle(6.5, 4)
                        },
                        {
                            width: `auto`,
                            text: this.translate.instant(`As recommendation`)
                        },
                        {
                            width: 20,
                            text: ``
                        },
                        {
                            width: 8,
                            canvas: this.pdfDocumentService.drawCircle(6.5, 4)
                        },
                        {
                            width: `auto`,
                            text: this.translate.instant(`Divergent:`)
                        }
                    ]
                }
            ]);
        }

        if (metaTableBody.length > 0) {
            return {
                table: {
                    widths: [`35%`, `65%`],
                    body: metaTableBody
                },
                margin: [0, 0, 0, 10],
                layout: `metaboxLayout`
            };
        }

        return {};
    }

    /**
     * Creates the motion preamble
     *
     * @returns doc def for the motion text
     */
    private createPreamble(): object {
        const motions_preamble = this.meetingSettingsService.instant(`motions_preamble`) as string;
        return {
            text: `${motions_preamble}`,
            margin: [0, 10, 0, 10]
        };
    }

    /**
     * Creates the motion text - uses HTML to PDF
     *
     * @param motion the motion to convert to pdf
     * @param lineLength the current line length
     * @param lnMode determine the used line mode
     * @param crMode determine the used change Recommendation mode
     * @returns doc def for the "the assembly may decide" preamble
     */
    private createText({ crMode, lineHeight, lineLength, lnMode, motion }: CreateTextData): object {
        let htmlText = ``;

        if (motion.isParagraphBasedAmendment()) {
            // this is logically redundant with the formation of amendments in the motion-detail html.
            // Should be refactored in a way that a service returns the correct html for both cases
            try {
                const changeRecos = this.changeRecoRepo.getChangeRecoOfMotion(motion.id);
                const amendmentParas = this.motionLineNumbering.getAmendmentParagraphLines(
                    motion,
                    lineLength,
                    crMode,
                    changeRecos,
                    false
                );
                for (const paragraph of amendmentParas) {
                    htmlText += `<h3>` + this.motionLineNumbering.getAmendmentParagraphLinesTitle(paragraph) + `</h3>`;
                    htmlText += `<div class="paragraphcontext">${paragraph.textPre}</div>`;
                    htmlText += paragraph.text;
                    htmlText += `<div class="paragraphcontext">${paragraph.textPost}</div>`;
                }
            } catch (e: any) {
                htmlText += `<em style="color: red; font-weight: bold;">` + e.toString() + `</em>`;
            }
        } else if (motion.isStatuteAmendment()) {
            // statute amendments
            const statutes = this.statuteRepo.getViewModelList();
            htmlText = this.motionLineNumbering.formatStatuteAmendment(statutes, motion, lineLength);
        } else {
            // lead motion or normal amendments

            const changes = this.motionFormatService.getUnifiedChanges(motion, lineLength);
            const textChanges = changes.filter(change => !change.isTitleChange());
            const titleChange = changes.find(change => change.isTitleChange());

            if (crMode === ChangeRecoMode.Diff && titleChange) {
                const changedTitle = this.changeRecoRepo.getTitleChangesAsDiff(motion.title, titleChange);
                htmlText +=
                    `<span><strong>` +
                    this.translate.instant(`Changed title`) +
                    `:</strong><br>` +
                    changedTitle +
                    `</span><br>`;
            }
            const formattedText = this.motionFormatService.formatMotion({
                targetMotion: motion,
                crMode,
                changes: textChanges,
                lineLength,
                firstLine: motion.firstLine
            });
            // reformat motion text to split long HTML elements to easier convert into PDF
            htmlText += this.linenumberingService.splitInlineElementsAtLineBreaks(formattedText);
        }

        return this.htmlToPdfService.convertHtml({ htmlText, lnMode, lineHeight });
    }

    /**
     * Creates the motion reason - uses HTML to PDF
     *
     * @param motion the target motion
     *
     * @returns doc def for the reason as array
     */
    private createReason(motion: ViewMotion): object {
        if (motion.reason) {
            const reason = [];

            // add the reason "head line"
            reason.push({
                text: this.translate.instant(`Reason`),
                style: `heading3`,
                margin: [0, 10, 0, 10]
            });

            reason.push(this.htmlToPdfService.addPlainText(motion.reason));

            return reason;
        } else {
            return {};
        }
    }

    /**
     * Creates the motion attachments.
     *
     * @param motion the target motion
     *
     * @returns doc def for the attachments as array
     */

    private createAttachments(motion: ViewMotion): object {
        let width = this.pdfDocumentService.pageSize === `A5` ? PDF_A5_POINTS_WIDTH : PDF_A4_POINTS_WIDTH;
        width = width - this.pdfDocumentService.pageMarginPointsLeft - this.pdfDocumentService.pageMarginPointsRight;
        const instancUrl = this.organizationSettingsService.instant(`url`);

        const attachments = [];
        attachments.push({
            text: this.translate.instant(`Attachments`),
            style: `heading3`,
            margin: [0, 10, 0, 10]
        });

        for (const key of Object.keys(motion.attachments)) {
            const attachment = motion.attachments[key];
            const fileUrl = attachment.getDetailStateUrl();
            if (this.pdfImagesService.isImageUsableForPdf(attachment.mimetype)) {
                this.pdfImagesService.addImageUrl(fileUrl);
                attachments.push({
                    image: fileUrl,
                    width: width,
                    margin: [0, 0, 0, 10]
                });
            } else {
                attachments.push({
                    ul: [
                        {
                            text: attachment.getTitle() + `: ` + instancUrl + fileUrl,
                            link: instancUrl + fileUrl,
                            margin: [0, 0, 0, 5]
                        }
                    ]
                });
            }
        }

        return attachments;
    }

    /**
     * Creates pdfMake definitions for the call list of given motions
     * Any motions that are 'top level' (no sort_parent_id) will have their tags
     * used as comma separated header titles in an extra row
     *
     * @param motions A list of motions
     * @returns definitions ready to be opened or exported via {@link PdfDocumentService}
     */
    public callListToDoc(motions: ViewMotion[]): object {
        motions.sort((a, b) => a.sort_weight - b.sort_weight);
        const title = {
            text: this.translate.instant(`Call list`),
            style: `title`
        };
        const callListTableBody: object[] = [
            [
                {
                    text: this.translate.instant(`Called`),
                    style: `tableHeader`
                },
                {
                    text: this.translate.instant(`Called with`),
                    style: `tableHeader`
                },
                {
                    text: this.translate.instant(`Submitters`),
                    style: `tableHeader`
                },
                {
                    text: this.translate.instant(`Title`),
                    style: `tableHeader`
                },
                {
                    text: this.translate.instant(`Recommendation`),
                    style: `tableHeader`
                },
                {
                    text: this.translate.instant(`Notes`),
                    style: `tableHeader`
                }
            ]
        ];

        const callListRows: object[] = [];
        let currentTitle = ``;

        motions.forEach(motion => {
            if (!motion.sort_parent_id) {
                const heading = motion.tags ? motion.tags.map(tag => tag.name).join(`, `) : ``;
                if (heading !== currentTitle) {
                    callListRows.push([
                        {
                            text: heading,
                            colSpan: 6,
                            style: `heading3`,
                            margin: [0, 10, 0, 10]
                        },
                        ``,
                        ``,
                        ``,
                        ``,
                        ``
                    ]);
                    currentTitle = heading;
                }
            }
            callListRows.push(this.createCallListRow(motion));
        });

        const table: object = {
            table: {
                widths: [`auto`, `auto`, `auto`, `*`, `auto`, `auto`],
                headerRows: 1,
                dontBreakRows: true,
                body: callListTableBody.concat(callListRows)
            },
            layout: `switchColorTableLayout`
        };
        return [title, table];
    }

    /**
     * Creates the pdfMake definitions for a row of the call List table
     *
     * @param motion
     * @returns pdfmakre definitions
     */
    private createCallListRow(motion: ViewMotion): object {
        return [
            {
                text: motion.sort_parent_id ? `` : motion.numberOrTitle
            },
            { text: motion.sort_parent_id ? motion.numberOrTitle : `` },
            { text: motion.submitters.length ? motion.submittersAsUsers.map(s => s.short_name).join(`, `) : `` },
            { text: motion.title },
            {
                text: motion.recommendation ? this.motionService.getExtendedRecommendationLabel(motion) : ``
            },
            { text: `` }
        ];
    }

    /**
     * Creates pdfmake definitions for basic information about the motion and
     * comments or notes
     *
     * @param note string optionally containing html layout
     * @param motion the ViewMotion this note refers to
     * @param noteTitle additional heading to be used (will be translated)
     * @returns pdfMake definitions
     */
    public textToDocDef(note: string, motion: ViewMotion, noteTitle: string): object {
        const lineLength = this.meetingSettingsService.instant(`motions_line_length`)!;
        const crMode = this.meetingSettingsService.instant(`motions_recommendation_text_mode`)!;
        const title = this.createTitle(motion, crMode, lineLength);
        const subtitle = this.createSubtitle(motion);
        const metaInfo = this.createMetaInfoTable(motion, lineLength, crMode, [`submitters`, `state`, `category`]);
        const noteContent = this.htmlToPdfService.convertHtml({ htmlText: note, lnMode: LineNumberingMode.None });

        const subHeading = {
            text: this.translate.instant(noteTitle),
            style: `heading2`
        };
        return [title, subtitle, metaInfo, subHeading, noteContent];
    }

    private createComments(motion: ViewMotion, comments: number[]): object[] {
        const result: object[] = [];
        for (const comment of comments) {
            let name = ``;
            let content = ``;
            if (comment === PERSONAL_NOTE_ID) {
                name = this.translate.instant(`Personal note`);
                content = motion && motion.getPersonalNote()! && motion.getPersonalNote()!.note;
            } else {
                const viewComment = this.commentRepo.getViewModel(comment)!;
                const section = motion.getCommentForSection(viewComment)!;
                name = viewComment.name;
                content = section && section.comment;
            }
            if (name && content) {
                result.push({ text: name, style: `heading3`, margin: [0, 10, 0, 10] });
                result.push(this.htmlToPdfService.addPlainText(content));
            }
        }
        return result;
    }
}
