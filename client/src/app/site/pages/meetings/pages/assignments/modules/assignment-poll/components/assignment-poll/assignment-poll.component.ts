import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { BasePollComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll.component';
import { VotingService } from 'src/app/site/pages/meetings/modules/poll/services/voting.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { VotingPrivacyWarningDialogService } from '../../../../../../modules/poll/modules/voting-privacy-dialog/services/voting-privacy-warning-dialog.service';
import { AssignmentPollPdfService } from '../../services/assignment-poll-pdf.service/assignment-poll-pdf.service';

@Component({
    selector: `os-assignment-poll`,
    templateUrl: `./assignment-poll.component.html`,
    styleUrls: [`./assignment-poll.component.scss`]
})
export class AssignmentPollComponent extends BasePollComponent implements OnInit {
    @Input()
    public set pollId(id: Id) {
        this.initializePoll(id);
    }

    @Output()
    public readonly dialogOpened = new EventEmitter<void>();

    public candidatesLabels: string[] = [];

    /**
     * Form for updating the poll's description
     */
    public descriptionForm!: UntypedFormGroup;

    /**
     * @returns true if the description on the form differs from the poll's description
     */
    public get dirtyDescription(): boolean {
        return this.descriptionForm.get(`description`)?.value !== this.poll.description;
    }

    public get showPoll(): boolean {
        if (this.poll) {
            if (
                this.operator.hasPerms(Permission.assignmentCanManage) ||
                this.poll.isPublished ||
                (this.poll.isEVoting && !this.poll.isCreated)
            ) {
                return true;
            }
        }
        return false;
    }

    public get showMetaInfo(): boolean {
        return !this.poll.stateHasVotes && this.operator.hasPerms(Permission.assignmentCanManage);
    }

    public get showCandidatesInMetaInfo(): boolean {
        return (!this.poll.stateHasVotes && !this.votingService.canVote(this.poll)) || this.poll.isListPoll;
    }

    public constructor(
        protected override translate: TranslateService,
        private formBuilder: UntypedFormBuilder,
        private pdfService: AssignmentPollPdfService,
        private operator: OperatorService,
        private votingService: VotingService,
        private votingPrivacyDialog: VotingPrivacyWarningDialogService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.descriptionForm = this.formBuilder.group({
            description: this.poll ? this.poll.description : ``
        });
    }

    /**
     * Print the PDF of this poll with the corresponding options and numbers
     */
    public printBallot(): void {
        try {
            this.pdfService.printBallots(this.poll);
        } catch (e: any) {
            console.error(e);
            this.raiseError(e);
        }
    }

    public openVotingWarning(): void {
        this.votingPrivacyDialog.open();
    }

    public getDetailLink(): string {
        return `/${this.poll.meeting_id}/assignments/polls/${this.poll.sequential_number}`;
    }
}
