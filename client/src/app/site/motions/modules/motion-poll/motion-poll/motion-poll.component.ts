import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

import { OperatorService } from 'app/core/core-services/operator.service';
import { MotionPollRepositoryService } from 'app/core/repositories/motions/motion-poll-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { VotingPrivacyWarningComponent } from 'app/shared/components/voting-privacy-warning/voting-privacy-warning.component';
import { infoDialogSettings } from 'app/shared/utils/dialog-settings';
import { ViewMotionPoll } from 'app/site/motions/models/view-motion-poll';
import { MotionPollDialogService } from 'app/site/motions/services/motion-poll-dialog.service';
import { MotionPollPdfService } from 'app/site/motions/services/motion-poll-pdf.service';
import { MotionPollService } from 'app/site/motions/services/motion-poll.service';
import { BasePollComponent } from 'app/site/polls/components/base-poll.component';
import { PollTableData } from 'app/site/polls/services/poll.service';

/**
 * Component to show a motion-poll.
 */
@Component({
    selector: 'os-motion-poll',
    templateUrl: './motion-poll.component.html',
    styleUrls: ['./motion-poll.component.scss']
})
export class MotionPollComponent extends BasePollComponent<ViewMotionPoll, MotionPollService> {
    @Input()
    public set poll(value: ViewMotionPoll) {
        this.initPoll(value);
        const chartData = this.pollService.generateChartData(value);
        this.chartDataSubject.next(chartData);
    }

    public get poll(): ViewMotionPoll {
        return this._poll;
    }

    public get pollLink(): string {
        return `/motions/polls/${this.poll.id}`;
    }

    public get showChart(): boolean {
        return this.pollService.showChart(this.poll);
    }

    public get reducedPollTableData(): PollTableData[] {
        return this.pollService
            .generateTableData(this.poll)
            .filter(data => ['yes', 'no', 'abstain', 'votesinvalid'].includes(data.votingOption));
    }

    public get showPoll(): boolean {
        if (this.poll) {
            if (
                this.operator.hasPerms('motions.can_manage_polls') ||
                this.poll.isPublished ||
                (this.poll.isEVoting && !this.poll.isCreated)
            ) {
                return true;
            }
        }
        return false;
    }

    public get isEVotingEnabled(): boolean {
        return this.pollService.isElectronicVotingEnabled;
    }

    /**
     * Constructor.
     *
     * @param title
     * @param translate
     * @param matSnackbar
     * @param router
     * @param motionRepo
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        promptService: PromptService,
        pollDialog: MotionPollDialogService,
        protected dialog: MatDialog,
        protected pollRepo: MotionPollRepositoryService,
        private pollService: MotionPollService,
        private pdfService: MotionPollPdfService,
        private operator: OperatorService
    ) {
        super(componentServiceCollector, dialog, promptService, pollRepo, pollDialog);
    }

    public openVotingWarning(): void {
        this.dialog.open(VotingPrivacyWarningComponent, infoDialogSettings);
    }

    public downloadPdf(): void {
        this.pdfService.printBallots(this.poll);
    }

    public async deletePoll(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete this vote?');
        const content = this.poll.getTitle();

        if (await this.promptService.open(title, content)) {
            this.repo.delete(this.poll).catch(this.raiseError);
        }
    }
}
