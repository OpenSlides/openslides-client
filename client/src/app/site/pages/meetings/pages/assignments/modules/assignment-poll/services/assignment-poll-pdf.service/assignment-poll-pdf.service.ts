import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PollMethod } from 'src/app/domain/models/poll/poll-constants';
import {
    AbstractPollData,
    BasePollPdfService
} from 'src/app/site/pages/meetings/modules/poll/base/base-poll-pdf.service';
import { PollKeyVerbosePipe } from 'src/app/site/pages/meetings/modules/poll/pipes';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service/participant-controller.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { MeetingPdfExportService } from 'src/app/site/pages/meetings/services/export';
import { MediaManageService } from 'src/app/site/pages/meetings/services/media-manage.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { AssignmentControllerService } from '../../../../services/assignment-controller.service';
import { ViewAssignment } from '../../../../view-models';
import { AssignmentPollService } from '../assignment-poll.service';
import { AssignmentPollServiceModule } from '../assignment-poll-service.module';

@Injectable({
    providedIn: AssignmentPollServiceModule
})
export class AssignmentPollPdfService extends BasePollPdfService {
    public constructor(
        meetingSettingsService: MeetingSettingsService,
        userRepo: ParticipantControllerService,
        activeMeetingService: ActiveMeetingService,
        mediaManageService: MediaManageService,
        pdfService: MeetingPdfExportService,
        protected override translate: TranslateService,
        private assignmentRepo: AssignmentControllerService,
        pollService: AssignmentPollService,
        pollKeyVerbose: PollKeyVerbosePipe
    ) {
        super(
            meetingSettingsService,
            userRepo,
            activeMeetingService,
            mediaManageService,
            pdfService,
            translate,
            pollService,
            pollKeyVerbose
        );
        meetingSettingsService
            .get(`assignment_poll_ballot_paper_number`)
            .subscribe(count => (this.ballotCustomCount = count));
        meetingSettingsService
            .get(`assignment_poll_ballot_paper_selection`)
            .subscribe(selection => (this.ballotCountSelection = selection));
    }

    /**
     * Triggers a pdf creation for this poll's ballots. Currently, only ballots
     * for a limited amount of candidates will return useful pdfs:
     * - about 15 candidates (method: yes/no and yes/no/abstain)
     * - about 29 candidates (one vote per candidate)
     *
     * @param title (optional) a different title
     * @param subtitle (optional) a different subtitle
     */
    public printBallots(poll: ViewPoll, title?: string, subtitle?: string): void {
        const assignment = this.assignmentRepo.getViewModel(poll.content_object?.id)!;
        const fileName = `${this.translate.instant(`Election`)} - ${assignment.getTitle()} - ${this.translate.instant(
            `ballot-paper` // TODO proper title (second election?)
        )}`;
        if (!title) {
            title = assignment.getTitle();
        }
        if (!subtitle) {
            subtitle = poll.getTitle();
        }
        if (subtitle.length > 90) {
            subtitle = subtitle.substring(0, 90) + `...`;
        }
        let rowsPerPage = this.getRowsPerPage(poll);
        const sheetEnd = Math.floor(417 / rowsPerPage);
        this.downloadWithBallotPaper(
            this.getPages(rowsPerPage, { sheetend: sheetEnd, title, subtitle, poll }),
            fileName
        );
    }

    protected getPollResultFileNamePrefix(poll: ViewPoll): string {
        return (poll.content_object as ViewAssignment)?.getTitle();
    }

    /**
     * Creates one ballot in it's position on the page. Note that creating once
     * and then pasting the result several times does not work
     */
    protected createBallot(data: AbstractPollData): object {
        return {
            columns: [
                {
                    width: 1,
                    margin: [0, data.sheetend],
                    text: ``
                },
                {
                    width: `*`,
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

    private createCandidateFields(poll: ViewPoll): object {
        const candidates = poll.options.sort((a, b) => a.weight - b.weight);
        const resultObject = candidates.map(cand => {
            const candidateName = cand.content_object?.full_name;
            if (candidateName) {
                return poll.pollmethod === PollMethod.Y
                    ? this.createBallotOption(candidateName)
                    : this.createYNBallotEntry(candidateName, poll.pollmethod);
            } else {
                throw new Error(this.translate.instant(`This ballot contains deleted users.`));
            }
        });

        if (poll.pollmethod === PollMethod.Y) {
            if (poll.global_yes) {
                const yesEntry = this.createBallotOption(this.translate.instant(`Yes`));
                yesEntry.margin[1] = 25;
                resultObject.push(yesEntry);
            }

            if (poll.global_no) {
                const noEntry = this.createBallotOption(this.translate.instant(`No`));
                noEntry.margin[1] = 25;
                resultObject.push(noEntry);
            }

            if (poll.global_abstain) {
                const abstainEntry = this.createBallotOption(this.translate.instant(`Abstain`));
                abstainEntry.margin[1] = 25;
                resultObject.push(abstainEntry);
            }
        }
        return resultObject;
    }

    private createYNBallotEntry(option: string, method: PollMethod): object {
        const choices = method === `YNA` ? [`Yes`, `No`, `Abstain`] : [`Yes`, `No`];
        const columnstack = choices.map(choice => ({
            width: `auto`,
            stack: [this.createBallotOption(this.translate.instant(choice))]
        }));
        return [
            {
                text: option,
                margin: [21, 10, 0, 0]
            },
            {
                width: `auto`,
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
    private createPollHint(poll: ViewPoll): object {
        return {
            text: poll.content_object?.default_poll_description || ``,
            style: `description`
        };
    }
}
