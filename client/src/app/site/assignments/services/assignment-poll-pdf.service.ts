import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { AbstractPollData, BallotCountChoices, PollPdfService } from 'app/core/pdf-services/base-poll-pdf-service';
import { PdfDocumentService } from 'app/core/pdf-services/pdf-document.service';
import { AssignmentRepositoryService } from 'app/core/repositories/assignments/assignment-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { OrganisationSettingsService } from 'app/core/ui-services/organisation-settings.service';
import { AssignmentPollMethod } from 'app/shared/models/assignments/assignment-poll';
import { ViewAssignmentPoll } from '../models/view-assignment-poll';

/**
 * Creates a pdf for a motion poll. Takes as input any motionPoll
 * Provides the public method `printBallots(motionPoll)` which should be convenient to use.
 *
 * @example
 * ```ts
 * this.AssignmentPollPdfService.printBallots(this.poll);
 * ```
 */
@Injectable({
    providedIn: 'root'
})
export class AssignmentPollPdfService extends PollPdfService {
    /**
     * Constructor. Subscribes to configuration values
     *
     * @param translate handle translations
     * @param motionRepo get parent motions
     * @param organisationSettingsService Read config variables
     * @param userRepo User repository for counting amount of ballots needed
     * @param pdfService the pdf document creation service
     */
    public constructor(
        organisationSettingsService: OrganisationSettingsService,
        userRepo: UserRepositoryService,
        activeMeetingService: ActiveMeetingService,
        private translate: TranslateService,
        private assignmentRepo: AssignmentRepositoryService,
        private pdfService: PdfDocumentService
    ) {
        super(organisationSettingsService, userRepo, activeMeetingService);
        this.organisationSettingsService
            .get<number>('assignments_pdf_ballot_papers_number')
            .subscribe(count => (this.ballotCustomCount = count));
        this.organisationSettingsService
            .get<BallotCountChoices>('assignments_pdf_ballot_papers_selection')
            .subscribe(selection => (this.ballotCountSelection = selection));
    }

    /**
     * Triggers a pdf creation for this poll's ballots. Currently, only ballots
     * for a limited amount of candidates will return useful pdfs:
     * - about 15 candidates (method: yes/no and yes/no/abstain)
     * - about 29 candidates (one vote per candidate)
     *
     * @param motionPoll: The poll this ballot refers to
     * @param title (optional) a different title
     * @param subtitle (optional) a different subtitle
     */
    public printBallots(poll: ViewAssignmentPoll, title?: string, subtitle?: string): void {
        const assignment = this.assignmentRepo.getViewModel(poll.assignment_id);
        const fileName = `${this.translate.instant('Election')} - ${assignment.getTitle()} - ${this.translate.instant(
            'ballot-paper' // TODO proper title (second election?)
        )}`;
        if (!title) {
            title = assignment.getTitle();
        }
        if (!subtitle) {
            subtitle = '';
        }
        if (assignment.polls.length > 1) {
            subtitle = `${this.translate.instant('Ballot')} ${assignment.polls.length} ${subtitle}`;
        }
        if (subtitle.length > 90) {
            subtitle = subtitle.substring(0, 90) + '...';
        }
        let rowsPerPage = 1;
        if (poll.pollmethod === 'votes') {
            if (poll.options.length <= 2) {
                rowsPerPage = 4;
            } else if (poll.options.length <= 5) {
                rowsPerPage = 3;
            } else if (poll.options.length <= 10) {
                rowsPerPage = 2;
            } else {
                rowsPerPage = 1;
            }
        } else {
            if (poll.options.length <= 2) {
                rowsPerPage = 4;
            } else if (poll.options.length <= 3) {
                rowsPerPage = 3;
            } else if (poll.options.length <= 7) {
                rowsPerPage = 2;
            } else {
                // up to 15 candidates
                rowsPerPage = 1;
            }
        }
        const sheetEnd = Math.floor(417 / rowsPerPage);
        this.pdfService.downloadWithBallotPaper(
            this.getPages(rowsPerPage, { sheetend: sheetEnd, title: title, subtitle: subtitle, poll: poll }),
            fileName,
            this.logo
        );
    }

    /**
     * Creates one ballot in it's position on the page. Note that creating once
     * and then pasting the result several times does not work
     *
     * @param title The number of the motion
     * @param subtitle The actual motion title
     */
    protected createBallot(data: AbstractPollData): object {
        return {
            columns: [
                {
                    width: 1,
                    margin: [0, data.sheetend],
                    text: ''
                },
                {
                    width: '*',
                    stack: [
                        this.getHeader(),
                        this.getTitle(data.title),
                        this.getSubtitle(data.subtitle),
                        this.createPollHint(data.poll),
                        this.createCandidateFields(data.poll)
                    ],
                    margin: [0, 0, 0, 0]
                }
            ]
        };
    }

    private createCandidateFields(poll: ViewAssignmentPoll): object {
        const candidates = poll.options.sort((a, b) => {
            return a.weight - b.weight;
        });
        const resultObject = candidates.map(cand => {
            return poll.pollmethod === 'votes'
                ? this.createBallotOption(cand.user.full_name)
                : this.createYNBallotEntry(cand.user.full_name, poll.pollmethod);
        });

        if (poll.pollmethod === 'votes') {
            if (poll.global_no) {
                const noEntry = this.createBallotOption(this.translate.instant('No'));
                noEntry.margin[1] = 25;
                resultObject.push(noEntry);
            }

            if (poll.global_abstain) {
                const abstainEntry = this.createBallotOption(this.translate.instant('Abstain'));
                abstainEntry.margin[1] = 25;
                resultObject.push(abstainEntry);
            }
        }
        return resultObject;
    }

    private createYNBallotEntry(option: string, method: AssignmentPollMethod): object {
        const choices = method === 'YNA' ? ['Yes', 'No', 'Abstain'] : ['Yes', 'No'];
        const columnstack = choices.map(choice => {
            return {
                width: 'auto',
                stack: [this.createBallotOption(this.translate.instant(choice))]
            };
        });
        return [
            {
                text: option,
                margin: [40, 10, 0, 0]
            },
            {
                width: 'auto',
                columns: columnstack
            }
        ];
    }

    /**
     * Generates the poll description
     *
     * @param poll
     * @returns pdfMake definitions
     */
    private createPollHint(poll: ViewAssignmentPoll): object {
        return {
            text: poll.assignment.default_poll_description || '',
            style: 'description'
        };
    }
}
