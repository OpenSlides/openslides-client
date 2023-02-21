import { Directive } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { BallotPaperSelection } from 'src/app/domain/models/meetings/meeting';
import { PollMethod, PollTableData, VoteValuesVerbose, VotingResult } from 'src/app/domain/models/poll';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service/participant-controller.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { MeetingPdfExportService } from 'src/app/site/pages/meetings/services/export';
import { MediaManageService } from 'src/app/site/pages/meetings/services/media-manage.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

import { ViewUser } from '../../../view-models/view-user';
import { EntitledUsersTableEntry } from '../definitions';
import { PollKeyVerbosePipe } from '../pipes';
import { PollService } from '../services/poll.service';
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
        protected translate: TranslateService,
        protected pollService: PollService,
        private pollKeyVerbose: PollKeyVerbosePipe
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
            margin: [21 + BallotCircleDimensions.size, 10, 0, 0],
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
            margin: [20, 10, 10, -10], // [left, top, right, bottom]
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

    protected abstract getPollResultFileNamePrefix(poll: ViewPoll): string;

    /**
     * Downloads a pdf with the ballot papet page definitions.
     *
     * @param docDefinition the structure of the PDF document
     * @param filename the name of the file to use
     */
    public downloadWithBallotPaper(docDefinition: object, filename: string): void {
        this.pdfExport.downloadWaitableDoc(filename, () => this.getBallotPaper(docDefinition));
    }

    /**
     * Overall document definition and styles for blank PDF documents
     * (e.g. ballots)
     *
     * @param documentContent the content of the pdf as object
     * @returns the pdf document definition ready to export
     */
    private async getBallotPaper(documentContent: object): Promise<object> {
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

    protected getRowsPerPage(poll: ViewPoll): number {
        if (poll.pollmethod === PollMethod.Y) {
            if (poll.options.length <= 2) {
                return 4;
            } else if (poll.options.length <= 5) {
                return 3;
            } else if (poll.options.length <= 10) {
                return 2;
            }
        } else if (poll.options.length <= 2) {
            return 4;
        } else if (poll.options.length <= 3) {
            return 3;
        } else if (poll.options.length <= 7) {
            return 2;
        }

        return 1;
    }

    /**
     * Exports a single poll
     *
     * @param poll The poll to export
     */
    public exportSinglePoll(
        poll: ViewPoll,
        exportInfo?: {
            votesData?: BaseVoteData[];
            entitledUsersData?: EntitledUsersTableEntry[];
        }
    ): void {
        if (!exportInfo.votesData && !exportInfo.entitledUsersData) {
            throw Error(`Can't export due to missing data`);
        }

        const doc = this.pollToDocDef(poll, exportInfo);
        const filename = `${this.getPollResultFileNamePrefix(poll)}-${poll.getTitle()}`;
        const metadata = {
            title: filename
        };
        this.pdfExport.download({ docDefinition: doc, filename, metadata });
    }

    /**
     * Converts a poll to PdfMake doc definition
     *
     * @param motion the poll to convert to pdf
     * @returns doc def for the poll
     */
    public pollToDocDef(
        poll: ViewPoll,
        exportInfo?: {
            votesData?: BaseVoteData[];
            entitledUsersData?: EntitledUsersTableEntry[];
        }
    ): object {
        let pollResultPdfContent: any[] = [];
        const title = this.getTitle(`${poll.content_object?.getTitle()} · ${poll.getTitle()}`);

        pollResultPdfContent = [title];

        const resultsTable = this.pollService.generateTableData(poll);

        if (resultsTable) {
            pollResultPdfContent.push({
                text: this.translate.instant(`Result`),
                margin: [0, 0, 0, 5],
                bold: true
            });
            const resultsData = this.createResultsTable(poll, resultsTable);
            pollResultPdfContent.push(resultsData);
        }

        if (exportInfo.votesData?.length) {
            pollResultPdfContent.push({
                text: this.translate.instant(`Single votes`),
                margin: [0, 20, 0, 5],
                bold: true
            });
            const votesData = this.createVotesTable(exportInfo.votesData);
            pollResultPdfContent.push(votesData);
        }

        if (exportInfo.entitledUsersData?.length) {
            pollResultPdfContent.push({
                text: this.translate.instant(`Entitled users`),
                margin: [0, 20, 0, 5],
                bold: true
            });
            const usersData = this.createUsersTable(exportInfo.entitledUsersData);
            pollResultPdfContent.push(usersData);
        }

        return pollResultPdfContent;
    }

    /**
     * Creates the poll result table for the given poll
     *
     * @returns the table as pdfmake object
     */
    private createResultsTable(poll: ViewPoll, resultsTableData: PollTableData[]): object {
        const resultsTable = (JSON.parse(JSON.stringify(resultsTableData)) as PollTableData[]).map(date => {
            const forbidden = [`yes`, `no`, `abstain`].filter(
                option => !poll.pollmethod.includes(option.charAt(0).toUpperCase())
            );
            date.value = date.value?.filter(val => !forbidden.includes(val.vote));
            return date;
        });
        const amountColumns = Math.max(...resultsTable.map(row => row.value.length));
        const template = resultsTable.find(row => row.value.length === amountColumns);
        const pollTableBody: any[] = [
            [
                {
                    text: this.translate.instant(`Candidate`),
                    style: `tableHeader`
                },
                ...template.value.map(value => {
                    return {
                        text: this.translate.instant(value.vote ? this.pollKeyVerbose.transform(value.vote) : `Votes`),
                        style: `tableHeader`
                    };
                })
            ]
        ];

        let i = 0;
        for (const date of resultsTable) {
            const tableLine = [
                {
                    text: this.translate.instant(this.pollKeyVerbose.transform(date.votingOption))
                },
                ...Array.from({ length: amountColumns }, () => 0)
                    .map((_, index) => {
                        const hasValue = index < date.value.length;
                        const currentValue: VotingResult = hasValue
                            ? date.value[date.value.length - (index + 1)]
                            : undefined;
                        return hasValue
                            ? {
                                  text: `${currentValue.amount}${
                                      [`yes`, `no`, `abstain`].includes(currentValue.vote ?? date.votingOption)
                                          ? ` (${this.pollService.getVoteValueInPercent(
                                                currentValue.amount,
                                                currentValue.vote ? { poll, row: resultsTableData[i] } : { poll }
                                            )})`
                                          : ``
                                  }`
                              }
                            : { text: `` };
                    })
                    .reverse()
            ];

            pollTableBody.push(tableLine);
            i++;
        }

        return this.generateResultsTableObject(pollTableBody, amountColumns);
    }

    private generateResultsTableObject(pollTableBody: any[], amountColumns: number): object {
        return [
            {
                table: {
                    widths: [
                        `54%`,
                        ...Array.from({ length: amountColumns }, () => `${Math.floor(46 / amountColumns)}%`)
                    ],
                    headerRows: 1,
                    body: pollTableBody
                },
                layout: `switchColorTableLayout`
            }
        ];
    }

    /**
     * Creates the poll vote table for the given votesData
     *
     * @returns the table as pdfmake object
     */
    private createVotesTable(votesData: BaseVoteData[]): object {
        const pollTableBody: any[] = [
            [
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
            ]
        ];

        let index = 1;
        for (const date of votesData.sort((entryA, entryB) =>
            entryA.user?.getName().localeCompare(entryB.user?.getName())
        )) {
            const tableLine = [
                {
                    text: index
                },
                {
                    text: this.getUserNameForExport(date.user)
                },
                {
                    text: this.parseSingleResult(date[`votes`] ?? date[`value`])
                }
            ];

            pollTableBody.push(tableLine);
            index++;
        }
        return this.generateTableObject(pollTableBody);
    }

    /**
     * Creates the poll entitled users table for the given usersData
     *
     * @returns the table as pdfmake object
     */
    private createUsersTable(usersData: EntitledUsersTableEntry[]): object {
        const pollTableBody: any[] = [
            [
                {
                    text: ``,
                    style: `tableHeader`
                },
                {
                    text: this.translate.instant(`Participant`),
                    style: `tableHeader`
                },
                {
                    text: this.translate.instant(`Has voted`),
                    style: `tableHeader`
                }
            ]
        ];

        let index = 1;
        for (const date of usersData.sort((entryA, entryB) =>
            entryA.user?.getName().localeCompare(entryB.user?.getName())
        )) {
            const tableLine = [
                {
                    text: index
                },
                {
                    text:
                        this.getUserNameForExport(date.user) +
                        (date.vote_delegated_to
                            ? `\n${this.translate.instant(`represented by`)} ` +
                              this.getUserNameForExport(date.vote_delegated_to)
                            : ``)
                },
                {
                    text: this.translate.instant(date.voted ? `Yes` : `No`)
                }
            ];

            pollTableBody.push(tableLine);
            index++;
        }
        return this.generateTableObject(pollTableBody);
    }

    private generateTableObject(pollTableBody: any[]): object {
        return [
            {
                table: {
                    widths: [`4%`, `48%`, `48%`],
                    headerRows: 1,
                    body: pollTableBody
                },
                layout: `switchColorTableLayout`
            }
        ];
    }

    private getUserNameForExport(user: ViewUser | undefined): string {
        return user?.getShortName() ?? this.translate.instant(`Anonymous`);
    }

    private parseSingleResult(resultData: any, indent = 0): string {
        const indentation = `  `.repeat(indent);
        if (Array.isArray(resultData)) {
            return resultData.map(value => this.parseSingleResult(value, indent)).join(`\n`);
        } else if (typeof resultData === `object`) {
            return Object.keys(resultData)
                .map(value => `${indentation}${value}:\n${this.parseSingleResult(resultData[value], indent + 1)}`)
                .join(`\n`);
        } else if (typeof resultData === `string` && Object.keys(VoteValuesVerbose).includes(resultData)) {
            return indentation + this.translate.instant(VoteValuesVerbose[resultData]);
        } else {
            return indentation + this.translate.instant(String(resultData));
        }
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
                margin: [20, 30, 0, 0]
            },
            description: {
                fontSize: 11,
                margin: [20, 0, 0, 0]
            }
        };
    }
}
