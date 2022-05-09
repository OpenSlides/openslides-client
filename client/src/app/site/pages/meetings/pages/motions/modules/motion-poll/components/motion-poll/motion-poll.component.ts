import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { BasePollComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll.component';
import { OperatorService } from 'src/app/site/services/operator.service';

import { VotingPrivacyWarningDialogService } from '../../../../../../modules/poll/modules/voting-privacy-dialog/services/voting-privacy-warning-dialog.service';
import { MotionPollService } from '../../services';
import { MotionPollPdfService } from '../../services/motion-poll-pdf.service/motion-poll-pdf.service';

@Component({
    selector: `os-motion-poll`,
    templateUrl: `./motion-poll.component.html`,
    styleUrls: [`./motion-poll.component.scss`]
})
export class MotionPollComponent extends BasePollComponent {
    @Input()
    public set pollId(id: Id) {
        this.initializePoll(id);
    }

    @Output()
    public dialogOpened = new EventEmitter<void>();

    public get showPoll(): boolean {
        if (this.poll) {
            if (
                this.operator.hasPerms(Permission.motionCanManagePolls) ||
                this.poll.isPublished ||
                (this.poll.isEVoting && !this.poll.isCreated)
            ) {
                return true;
            }
        }
        return false;
    }

    public get canSeeVotes(): boolean {
        return this.poll.hasVotes && this.poll.stateHasVotes;
    }

    public get isEVotingEnabled(): boolean {
        return this.pollService.isElectronicVotingEnabled;
    }

    public constructor(
        private pollService: MotionPollService,
        private pdfService: MotionPollPdfService,
        private operator: OperatorService,
        private votingPrivacyDialog: VotingPrivacyWarningDialogService
    ) {
        super();
    }

    public openVotingWarning(): void {
        this.votingPrivacyDialog.open();
    }

    public downloadPdf(): void {
        this.pdfService.printBallots(this.poll);
    }

    public getDetailLink(): string {
        return `/${this.activeMeetingId}/motions/polls/${this.poll.sequential_number}`;
    }
}
