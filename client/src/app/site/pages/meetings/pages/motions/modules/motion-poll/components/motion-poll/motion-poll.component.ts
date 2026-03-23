import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { ProjectorButtonModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector/projector-button/projector-button.module';
import { BasePollComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll.component';
import { PollComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll/poll.component';
import { OperatorService } from 'src/app/site/services/operator.service';
import { DirectivesModule } from 'src/app/ui/directives';

import { VotingPrivacyWarningDialogService } from '../../../../../../modules/poll/modules/voting-privacy-dialog/services/voting-privacy-warning-dialog.service';
import { ViewPoll } from '../../../../../polls';
import { MotionPollService } from '../../services';
import { MotionPollPdfService } from '../../services/motion-poll-pdf.service/motion-poll-pdf.service';
import { MotionPollDetailContentComponent } from '../motion-poll-detail-content/motion-poll-detail-content.component';

@Component({
    selector: `os-motion-poll`,
    imports: [
        MotionPollDetailContentComponent,
        PollComponent,
        RouterModule,
        TranslatePipe,
        DirectivesModule,
        MatButtonModule,
        MatCardModule,
        MatTooltipModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        ProjectorButtonModule
    ],
    templateUrl: `./motion-poll.component.html`,
    styleUrls: [`./motion-poll.component.scss`]
})
export class MotionPollComponent extends BasePollComponent {
    @Input()
    public set pollViewModel(poll: ViewPoll) {
        this.poll = poll;
    }

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

    public get isAnonymous(): boolean {
        return this.operator.isAnonymousLoggedIn;
    }

    public get canSeeVotes(): boolean {
        /*
        const option = this.poll.options[0];
        return (
            (this.poll.hasVotes && this.poll.stateHasVotes) ||
            [option?.yes, option?.no, option?.abstain].some(value => value === VOTE_MAJORITY)
        );
        */

        return this.poll.hasVotes;
    }

    public get isEVotingEnabled(): boolean {
        return this.pollService.isElectronicVotingEnabled;
    }

    public get isPublished(): boolean {
        return this.poll.isPublished;
    }

    public get isSameMeeting(): boolean {
        return !this.poll.meeting_id || this.activeMeetingId === this.poll.meeting_id;
    }

    public get canManagePoll(): boolean {
        return this.operator.hasPerms(Permission.motionCanManagePolls);
    }

    public constructor(
        protected override translate: TranslateService,
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
