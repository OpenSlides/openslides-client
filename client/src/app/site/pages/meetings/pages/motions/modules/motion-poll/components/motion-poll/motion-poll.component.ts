import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { PollState, VOTE_MAJORITY } from 'src/app/domain/models/poll';
import { BasePollComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll.component';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service/poll-controller.service';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ChoiceService } from 'src/app/ui/modules/choice-dialog';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

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
        return (
            (this.poll.hasVotes && this.poll.stateHasVotes) ||
            this.poll.options.some(option =>
                [option.yes, option.no, option.abstain].some(value => value === VOTE_MAJORITY)
            )
        );
    }

    public get isEVotingEnabled(): boolean {
        return this.pollService.isElectronicVotingEnabled;
    }

    public get isPublished(): boolean {
        return this.poll.state === PollState.Published;
    }

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        promptService: PromptService,
        choiceService: ChoiceService,
        pollRepo: PollControllerService,
        private pollService: MotionPollService,
        private pdfService: MotionPollPdfService,
        private operator: OperatorService,
        private votingPrivacyDialog: VotingPrivacyWarningDialogService
    ) {
        super(componentServiceCollector, translate, promptService, choiceService, pollRepo);
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
