import { Directive } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { BallotPaperSelection } from 'src/app/domain/models/meetings/meeting';
import { ChangeRecoMode, LineNumberingMode } from 'src/app/domain/models/motions/motions.constants';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service/participant-controller.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { MeetingPdfExportService } from 'src/app/site/pages/meetings/services/export';
import { MediaManageService } from 'src/app/site/pages/meetings/services/media-manage.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

import { ExportFileFormat } from '../../../pages/motions/services/export/definitions';
import { BaseVoteData } from './base-poll-detail.component';

/**
 * Workaround data definitions. The implementation for the different model's classes might have different needs,
 * so some data might not be required.
 *
 */
export interface AbstractPollData {
    title: string;
    subtitle?: string;
    sheetend: number; // should reflect the vertical size of one ballot on the paper
    poll: ViewPoll;
}

@Directive()
export abstract class BasePollPdfService {
    /**
     * Definition of method to decide which amount of ballots to print. The implementations
     * are expected to fetch this information from the configuration service
     * @see BallotPaperSelection
     */
    protected ballotCountSelection: BallotPaperSelection = `CUSTOM_NUMBER`;

    /**
     * An arbitrary number of ballots to print, if {@link ballotCountSelection} is set
     * to CUSTOM_NUMBER. Value is expected to be fetched from the configuration`
     */
    protected ballotCustomCount: number = 0;

    /**
     * The event name
     */
    protected eventName: string = ``;

    /**
     * The url of the logo to be printed
     */
    protected logoUrl: string = ``;

    private get activeMeeting(): ViewMeeting {
        return this.activeMeetingService.meeting!;
    }

    private get activeMeetingId(): Id {
        return this.activeMeetingService.meetingId!;
    }

    public constructor(
        protected meetingSettingsService: MeetingSettingsService,
        protected userRepo: ParticipantControllerService,
        protected activeMeetingService: ActiveMeetingService,
        protected mediaManageService: MediaManageService,
        protected pdfExport: MeetingPdfExportService,
        protected translate: TranslateService
    ) {
        this.meetingSettingsService.get(`name`).subscribe(name => (this.eventName = name));
        this.mediaManageService.getLogoUrlObservable(`pdf_ballot_paper`).subscribe(url => (this.logoUrl = url));
    }

    /**
     * Get the amount of ballots to be printed
     *
     * @returns the amount of ballots, depending on the config settings
     */
    protected getBallotCount(): number {
        switch (this.ballotCountSelection) {
            case `NUMBER_OF_ALL_PARTICIPANTS`:
                return this.userRepo.getViewModelList().length;
            case `NUMBER_OF_DELEGATES`:
                return this.userRepo
                    .getViewModelList()
                    .filter(
                        user =>
                            user.group_ids(this.activeMeetingId) &&
                            user.group_ids(this.activeMeetingId).includes(this.activeMeeting.admin_group_id)
                    ).length;
            case `CUSTOM_NUMBER`:
                return this.ballotCustomCount;
            default:
                throw new Error(`Amount of ballots cannot be computed`);
        }
    }

    /**
     * Creates an entry for an option (a label with a circle)
     *
     * @returns pdfMake definitions
     */
    protected createBallotOption(decision: string): { margin: number[]; columns: object[] } {
        const BallotCircleDimensions = { yDistance: 6, size: 8 };
        return {
            margin: [40 + BallotCircleDimensions.size, 10, 0, 0],
            columns: [
                {
                    width: 15,
                    canvas: this.drawCircle(BallotCircleDimensions.yDistance, BallotCircleDimensions.size)
                },
                {
                    width: `auto`,
                    text: decision
                }
            ]
        };
    }

    /**
     * Helper to draw a circle on its position on the ballot paper
     *
     * @param y vertical offset
     * @param size the size of the circle
     * @returns an array containing one circle definition for pdfMake
     */
    private drawCircle(y: number, size: number): object[] {
        return [
            {
                type: `ellipse`,
                x: 0,
                y,
                lineColor: `black`,
                r1: size,
                r2: size
            }
        ];
    }

    /**
     * Abstract function for creating a single ballot with header and all options
     *
     * @param data AbstractPollData
     * @returns pdfmake definitions
     */
    protected abstract createBallot(data: AbstractPollData): object;

    /**
     * Create a createPdf definition for the correct amount of ballots
     *
     * @param rowsPerPage (precalculated) value of pair of ballots fitting on one page.
     * A value too high might result in phantom items split onto several pages
     * @param data predefined data to be used
     * @returns pdfmake definitions
     */
    protected getPages(rowsPerPage: number, data: AbstractPollData): object {
        const amount = this.getBallotCount();
        const fullpages = Math.floor(amount / (rowsPerPage * 2));
        let partialpageEntries = amount % (rowsPerPage * 2);
        const content: object[] = [];
        for (let i = 0; i < fullpages; i++) {
            const body = [];
            for (let j = 0; j < rowsPerPage; j++) {
                body.push([this.createBallot(data), this.createBallot(data)]);
            }
            content.push({
                table: {
                    headerRows: 1,
                    widths: [`*`, `*`],
                    body,
                    pageBreak: `after`
                },
                rowsperpage: rowsPerPage
            });
        }
        if (partialpageEntries) {
            const partialPageBody = [];
            while (partialpageEntries > 1) {
                partialPageBody.push([this.createBallot(data), this.createBallot(data)]);
                partialpageEntries -= 2;
            }
            if (partialpageEntries === 1) {
                partialPageBody.push([this.createBallot(data), ``]);
            }
            content.push({
                table: {
                    headerRows: 1,
                    widths: [`50%`, `50%`],
                    body: partialPageBody
                },
                rowsperpage: rowsPerPage
            });
        }
        return content;
    }

    /**
     * get a pdfMake header definition with the event name and an optional logo
     *
     * @returns pdfMake definitions
     */
    protected getHeader(): object {
        const columns: object[] = [];
        columns.push({
            text: this.eventName,
            fontSize: 8,
            alignment: `left`,
            width: `60%`
        });

        if (this.logoUrl) {
            columns.push({
                image: this.logoUrl,
                fit: [90, 25],
                alignment: `right`,
                width: `40%`
            });
        }
        return {
            color: `#555`,
            fontSize: 10,
            margin: [30, 10, 10, -10], // [left, top, right, bottom]
            columns,
            columnGap: 5
        };
    }

    /**
     * create a pdfmake definition for a title entry
     *
     * @param title
     * @returns pdfmake definition
     */
    protected getTitle(title: string): object {
        return {
            text: title,
            style: `title`
        };
    }

    /**
     * create a pdfmake definition for a subtitle entry
     *
     * @param subtitle
     * @returns pdfmake definition
     */
    protected getSubtitle(subtitle?: string): object {
        return {
            text: subtitle,
            style: `description`
        };
    }

    /**
     * Downloads a pdf with the ballot papet page definitions.
     *
     * @param docDefinition the structure of the PDF document
     * @param filename the name of the file to use
     * @param logo (optional) url of a logo to be placed as ballot logo
     */
    public downloadWithBallotPaper(docDefinition: object, filename: string, logo?: string): void {
        this.pdfExport.downloadWaitableDoc(filename, () => this.getBallotPaper(docDefinition, logo));
    }

    /**
     * Overall document definition and styles for blank PDF documents
     * (e.g. ballots)
     *
     * @param documentContent the content of the pdf as object
     * @param imageUrl an optional image to insert into the ballot
     * @returns the pdf document definition ready to export
     */
    private async getBallotPaper(documentContent: object, imageUrl?: string): Promise<object> {
        // this.imageUrls = imageUrl ? [imageUrl] : [];
        const result = {
            pageSize: `A4`,
            pageMargins: [0, 0, 0, 0],
            defaultStyle: {
                font: `PdfFont`,
                fontSize: 10
            },
            content: documentContent,
            styles: this.getBlankPaperStyles()
        };
        return result;
    }

    /**
     * Downloads a pdf with the result export page definitions.
     *
     * @param docDefinition the structure of the PDF document
     * @param filename the name of the file to use
     * @param logo (optional) url of a logo to be placed as ballot logo
     */
    public downloadWithResultPdf(poll: ViewPoll, /**docDefinition: object,*/ filename: string, logo?: string): void {
        this.pdfExport.downloadWaitableDoc(filename, () => this.getResultPdf(poll/**, docDefinition */, logo));
    }

    /**
     * @param documentContent the content of the pdf as object
     * @param imageUrl an optional image to insert into the ballot
     * @returns the pdf document definition ready to export
     */
    private async getResultPdf(poll: ViewPoll, /**documentContent: object, */imageUrl?: string): Promise<object> {
        // this.imageUrls = imageUrl ? [imageUrl] : [];
        const result = {
            pageSize: `A4`,
            pageMargins: [0, 0, 0, 0],
            defaultStyle: {
                font: `PdfFont`,
                fontSize: 10
            },
            // content: documentContent,
            styles: this.getBlankPaperStyles()
        };
        return result;
    }

    /**
     * Exports a single motions to PDFnumberOrTitle
     *
     * @param motion The motion to export
     */
    public exportSinglePoll(poll: ViewPoll, exportInfo?: {
        format?: ExportFileFormat;
        lnMode?: LineNumberingMode;
        crMode?: ChangeRecoMode;
        content?: string[];
        votesData?: BaseVoteData[],
        // metaInfo?: InfoToExport[];
        pdfOptions?: string[];
        comments?: number[];
    }): void {
        const doc = this.pollToDocDef( poll, exportInfo );
        const filename = `${this.translate.instant(`Poll result`)} ${poll.getTitle()}`;
        const metadata = {
            title: filename
        };
        this.pdfExport.download({ docDefinition: doc, filename, metadata });
    }

    /**
     * Converts a motion to PdfMake doc definition
     *
     * @param motion the motion to convert to pdf
     * @returns doc def for the motion
     */
    public pollToDocDef(poll: ViewPoll, exportInfo?: {
        format?: ExportFileFormat;
        lnMode?: LineNumberingMode;
        crMode?: ChangeRecoMode;
        content?: string[];
        votesData?: BaseVoteData[],
        // metaInfo?: InfoToExport[];
        pdfOptions?: string[];
        comments?: number[];
    }): object {
        let lnMode = exportInfo && exportInfo.lnMode ? exportInfo.lnMode : null;
        // let crMode = exportInfo && exportInfo.crMode ? exportInfo.crMode : null;
        // const infoToExport = exportInfo ? exportInfo.metaInfo : null;
        // const contentToExport = exportInfo ? exportInfo.content : null;
        // let commentsToExport = exportInfo ? exportInfo.comments : null;

        // // get the line length from the config
        // const lineLength = 85;
        // // whether to append checkboxes to follow the recommendation or not
        // const optionToFollowRecommendation = false;

        let pollResultPdfContent: any[] = [];

        // Enforces that statutes should always have Diff Mode and no line numbers
        // if (motion.isStatuteAmendment()) {
        //     lnMode = LineNumberingMode.None;
        //     crMode = ChangeRecoMode.Diff;
        // }

        // determine the default lnMode if not explicitly given
        if (!lnMode) {
            lnMode = LineNumberingMode.Outside;
        }

        // determine the default crMode if not explicitly given
        // if (!crMode) {
        //     crMode = this.meetingSettingsService.instant(`motions_recommendation_text_mode`)!;
        // }
        // if (!continuousText) {
        const title = {
            text: `${this.translate.instant(`Result for`)} ${poll.getTitle()}`,
            style: `title`
        }
            // const sequential =
            //     infoToExport?.includes(`sequential_number`) ??
            //     (this.meetingSettingsService.instant(`motions_show_sequential_number`) as boolean);
        const subtitle = `${this.translate.instant(`In`)} ${poll.content_object?.getTitle()}`;

        pollResultPdfContent = [title, subtitle];
        // }
        // if (((infoToExport && infoToExport.length > 0) || !infoToExport) && !continuousText) {
        //     const metaInfo = this.createMetaInfoTable(
        //         motion,
        //         lineLength,
        //         crMode,
        //         infoToExport,
        //         optionToFollowRecommendation
        //     );
        //     motionPdfContent.push(metaInfo);
        // }

        if (exportInfo.votesData) {
            const votesData = this.createVotesTable(poll, exportInfo.votesData);
            pollResultPdfContent.push(votesData);
        }

        // if (!contentToExport || contentToExport.includes(`text`)) {
        //     if (motion.showPreamble && !continuousText) {
        //         const preamble = this.createPreamble();
        //         motionPdfContent.push(preamble);
        //     }
        //     const lineHeight = this.meetingSettingsService.instant(`export_pdf_line_height`)!;
        //     const text = this.createText({
        //         motion,
        //         lineLength,
        //         lnMode,
        //         crMode,
        //         lineHeight
        //     });
        //     motionPdfContent.push(text);
        // }

        // if (!contentToExport || contentToExport.includes(`reason`)) {
        //     const reason = this.createReason(motion);
        //     motionPdfContent.push(reason);
        // }

        // if (
        //     exportInfo &&
        //     exportInfo.pdfOptions &&
        //     exportInfo.pdfOptions.includes(MOTION_PDF_OPTIONS.Attachments) &&
        //     motion.attachments.length > 0
        // ) {
        //     motionPdfContent.push(this.createAttachments(motion));
        // }

        // if (infoToExport && infoToExport.includes(`allcomments`)) {
        //     commentsToExport = this.commentRepo.getViewModelList().map(vm => vm.id);
        // }
        // if (commentsToExport) {
        //     motionPdfContent.push(this.createComments(motion, commentsToExport));
        // }

        return pollResultPdfContent;
    }

    /**
     * Creates the poll result table for all published polls
     *
     * @param assignment the ViewAssignment to create the document for
     * @returns the table as pdfmake object
     */
    private createVotesTable(poll: ViewPoll, votesData: BaseVoteData[]): object {
        const resultBody = [];
        // for (const poll of assignment.polls) {
            if (poll.isPublished) {
                const pollTableBody = [];

                // resultBody.push({
                //     text: poll.title,
                //     bold: true,
                //     style: `textItem`,
                //     margin: [0, 15, 0, 0]
                // });

                pollTableBody.push([
                    {
                        text: ``,
                        style: `tableHeader`
                    },
                    {
                        text: this.translate.instant(`Participant`),
                        style: `tableHeader`
                    },
                    {
                        text: this.translate.instant(`Votes`),
                        style: `tableHeader`
                    }
                ]);

                // const tableData = this.getPollService(poll).generateTableData(poll);
                let index = 1;
                for (const date of votesData) {
                    // const voteOption = this.translate.instant(this.pollKeyVerbose.transform(pollResult.votingOption));
                    // const resultLine = this.getPollResult(pollResult, poll);
                    const tableLine = [
                        {
                            text: index
                        },
                        {
                            text: date.user.getShortName()
                        },
                        {
                            text: `text` //date.valueVerbose ?? JSON.stringify(vote.votes)
                        }
                    ];

                    pollTableBody.push(tableLine);
                    index++;
                }

                resultBody.push({
                    table: {
                        widths: [`3%`, `61%`, `33%`],
                        headerRows: 1,
                        body: pollTableBody
                    },
                    layout: `switchColorTableLayout`
                });
            }
        // }

        return resultBody;
    }

    /**
     * Definition of styles for ballot papers
     *
     * @returns an object that contains a limited set of pdf styles
     *  used for ballots
     */
    private getBlankPaperStyles(): object {
        return {
            title: {
                fontSize: 14,
                bold: true,
                margin: [30, 30, 0, 0]
            },
            description: {
                fontSize: 11,
                margin: [30, 0, 0, 0]
            }
        };
    }
}
