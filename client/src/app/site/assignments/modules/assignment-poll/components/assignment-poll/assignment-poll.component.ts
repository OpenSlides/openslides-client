import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { OperatorService } from 'app/core/core-services/operator.service';
import { Id } from 'app/core/definitions/key-types';
import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { VotingService } from 'app/core/ui-services/voting.service';
import { VotingPrivacyWarningComponent } from 'app/shared/components/voting-privacy-warning/voting-privacy-warning.component';
import { PollState } from 'app/shared/models/poll/poll-constants';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { infoDialogSettings } from 'app/shared/utils/dialog-settings';
import { ViewAssignment } from 'app/site/assignments/models/view-assignment';
import { BasePollComponent } from 'app/site/polls/components/base-poll.component';
import { AssignmentPollDialogService } from '../../services/assignment-poll-dialog.service';
import { AssignmentPollPdfService } from '../../services/assignment-poll-pdf.service';
import { AssignmentPollService } from '../../services/assignment-poll.service';

/**
 * Component for a single assignment poll. Used in assignment detail view
 */
@Component({
    selector: 'os-assignment-poll',
    templateUrl: './assignment-poll.component.html',
    styleUrls: ['./assignment-poll.component.scss']
})
export class AssignmentPollComponent extends BasePollComponent<ViewAssignment> implements OnInit {
    @Input()
    public set pollId(id: Id) {
        this.initializePoll(id);
    }

    public get pollLink(): string {
        return `/${this.activeMeetingId}/assignments/polls/${this.poll.id}`;
    }

    public candidatesLabels: string[] = [];

    /**
     * Form for updating the poll's description
     */
    public descriptionForm: FormGroup;

    /**
     * @returns true if the description on the form differs from the poll's description
     */
    public get dirtyDescription(): boolean {
        return this.descriptionForm.get('description').value !== this.poll.description;
    }

    public get showPoll(): boolean {
        if (this.poll) {
            if (
                this.operator.hasPerms(this.permission.assignmentsCanManage) ||
                this.poll.isPublished ||
                (this.poll.isEVoting && !this.poll.isCreated)
            ) {
                return true;
            }
        }
        return false;
    }

    public get showMetaInfo(): boolean {
        return !this.poll.stateHasVotes && this.operator.hasPerms(this.permission.assignmentsCanManage);
    }

    public get showCandidatesInMetaInfo(): boolean {
        return !this.poll.stateHasVotes && !this.votingService.canVote(this.poll);
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        dialog: MatDialog,
        promptService: PromptService,
        repo: PollRepositoryService,
        pollDialog: AssignmentPollDialogService,
        private pollService: AssignmentPollService,
        private formBuilder: FormBuilder,
        private pdfService: AssignmentPollPdfService,
        private operator: OperatorService,
        private votingService: VotingService
    ) {
        super(componentServiceCollector, dialog, promptService, repo, pollDialog);
    }

    public ngOnInit(): void {
        this.descriptionForm = this.formBuilder.group({
            description: this.poll ? this.poll.description : ''
        });
    }

    /**
     * Print the PDF of this poll with the corresponding options and numbers
     */
    public printBallot(): void {
        try {
            this.pdfService.printBallots(this.poll);
        } catch (e) {
            console.error(e);
            this.raiseError(e);
        }
    }

    public openVotingWarning(): void {
        this.dialog.open(VotingPrivacyWarningComponent, infoDialogSettings);
    }

    protected onAfterUpdatePoll(poll: ViewPoll): void {
        if (poll.state !== PollState.Finished && poll.state !== PollState.Published) {
            return;
        }
        this.candidatesLabels = this.pollService.getChartLabels(poll);
        const chartData = this.pollService.generateChartData(poll);
        this.chartDataSubject.next(chartData);
    }
}
