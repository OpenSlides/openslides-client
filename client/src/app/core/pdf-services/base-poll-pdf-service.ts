import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { BallotPaperSelection } from 'app/shared/models/event-management/meeting';
import { ViewPoll } from 'app/shared/models/poll/view-poll';

import { ActiveMeetingIdService } from '../core-services/active-meeting-id.service';
import { MediaManageService } from '../ui-services/media-manage.service';
import { MeetingSettingsService } from '../ui-services/meeting-settings.service';

/**
 * Workaround data definitions. The implementation for the different model's classes might have different needs,
 * so some data might not be required.
 *
 */
export interface AbstractPollData {
    title: string;
    subtitle?: string;
    sheetend: number; // should reflect the vertical size of one ballot on the paper
    poll?: ViewPoll;
}

export abstract class PollPdfService {
    /**
     * Definition of method to decide which amount of ballots to print. The implementations
     * are expected to fetch this information from the configuration service
     * @see BallotPaperSelection
     */
    protected ballotCountSelection: BallotPaperSelection;

    /**
     * An arbitrary number of ballots to print, if {@link ballotCountSelection} is set
     * to CUSTOM_NUMBER. Value is expected to be fetched from the configuration`
     */
    protected ballotCustomCount: number;

    /**
     * The event name
     */
    protected eventName: string;

    /**
     * The url of the logo to be printed
     */
    protected logoUrl: string;

    public constructor(
        protected meetingSettingsService: MeetingSettingsService,
        protected userRepo: UserRepositoryService,
        protected activeMeetingIdService: ActiveMeetingIdService,
        protected mediaManageService: MediaManageService
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
                throw new Error(`TODO`);
            // TODO: the hard-coded 2 is not correct.
            /*return this.userRepo
                    .getViewModelList()
                    .filter(
                        user =>
                            user.group_ids(this.activeMeetingIdService.meetingId) &&
                            user.group_ids(this.activeMeetingIdService.meetingId).includes(2)
                    ).length;*/
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
    protected getSubtitle(subtitle: string): object {
        return {
            text: subtitle,
            style: `description`
        };
    }
}
