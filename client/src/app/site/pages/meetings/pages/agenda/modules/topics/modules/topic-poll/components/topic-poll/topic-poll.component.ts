import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { BasePollComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll.component';
import { PollComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll/poll.component';
import { VotingPrivacyWarningDialogService } from 'src/app/site/pages/meetings/modules/poll/modules/voting-privacy-dialog/services/voting-privacy-warning-dialog.service';
import { VotingService } from 'src/app/site/pages/meetings/modules/poll/services/voting.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ViewTopic } from '../../../../view-models';
import { TopicPollPdfService } from '../../services/topic-poll-pdf.service/topic-poll-pdf.service';

@Component({
    selector: `os-topic-poll`,
    templateUrl: `./topic-poll.component.html`,
    styleUrls: [`./topic-poll.component.scss`],
    imports: [PollComponent, MatCardModule]
})
export class TopicPollComponent extends BasePollComponent<ViewTopic> {
    @Input()
    public set pollId(id: Id) {
        this.initializePoll(id);
    }

    @Output()
    public readonly dialogOpened = new EventEmitter<void>();

    public candidatesLabels: string[] = [];

    public get shouldShowPoll(): boolean {
        if (this.poll) {
            if (
                this.operator.hasPerms(Permission.pollCanManage) ||
                this.poll.isPublished ||
                (this.poll.isEVoting && !this.poll.isCreated)
            ) {
                return true;
            }
        }
        return false;
    }

    public get showMetaInfo(): boolean {
        return !this.poll.stateHasVotes && this.operator.hasPerms(Permission.pollCanManage);
    }

    public get showCandidatesInMetaInfo(): boolean {
        return !this.poll.stateHasVotes && !this.votingService.canVote(this.poll);
    }

    public get canManagePoll(): boolean {
        return this.operator.hasPerms(Permission.pollCanManage);
    }

    public constructor(
        private formBuilder: UntypedFormBuilder,
        private operator: OperatorService,
        private votingService: VotingService,
        private votingPrivacyDialog: VotingPrivacyWarningDialogService,
        private pdfService: TopicPollPdfService
    ) {
        super();
    }

    /**
     * Print the PDF of this poll with the corresponding options and numbers
     */
    public printBallot(): void {
        try {
            console.log(`Can't print ballots (yet)`);
        } catch (e) {
            console.error(e);
            this.raiseError(e);
        }
    }

    public downloadPdf(): void {
        this.pdfService.printBallots(this.poll);
    }

    public openVotingWarning(): void {
        this.votingPrivacyDialog.open();
    }

    public getDetailLink(): string {
        return `/${this.poll.meeting_id}/topics/polls/${this.poll.sequential_number}`;
    }
}
