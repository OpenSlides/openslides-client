import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { BasePollComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll.component';
import { VotingCryptographyInfoDialogService } from 'src/app/site/pages/meetings/modules/poll/modules/voting-cryptography-info-dialog/services/voting-cryptography-info-dialog.service';
import { VotingPrivacyWarningDialogService } from 'src/app/site/pages/meetings/modules/poll/modules/voting-privacy-dialog/services/voting-privacy-warning-dialog.service';
import { PollDialogService } from 'src/app/site/pages/meetings/modules/poll/services/poll-dialog.service';
import { VotingService } from 'src/app/site/pages/meetings/modules/poll/services/voting.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ViewTopic } from '../../../../view-models';
import { TopicPollPdfService } from '../../services/topic-poll-pdf.service/topic-poll-pdf.service';

@Component({
    selector: `os-topic-poll`,
    templateUrl: `./topic-poll.component.html`,
    styleUrls: [`./topic-poll.component.scss`]
})
export class TopicPollComponent extends BasePollComponent<ViewTopic> implements OnInit {
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
    public descriptionForm: UntypedFormGroup;

    /**
     * @returns true if the description on the form differs from the poll's description
     */
    public get isDescriptionDirty(): boolean {
        return this.descriptionForm.get(`description`).value !== this.poll.description;
    }

    public get shouldShowPoll(): boolean {
        if (this.poll) {
            if (
                this.operator.hasPerms(Permission.agendaItemCanManage) ||
                this.poll.isPublished ||
                (this.poll.isEVoting && !this.poll.isCreated)
            ) {
                return true;
            }
        }
        return false;
    }

    public get showMetaInfo(): boolean {
        return !this.poll.stateHasVotes && this.operator.hasPerms(Permission.agendaItemCanManage);
    }

    public get showCandidatesInMetaInfo(): boolean {
        return !this.poll.stateHasVotes && !this.votingService.canVote(this.poll);
    }

    public constructor(
        private formBuilder: UntypedFormBuilder,
        private operator: OperatorService,
        private votingService: VotingService,
        votingPrivacyDialog: VotingPrivacyWarningDialogService,
        private pdfService: TopicPollPdfService,
        votingCryptoInfoDialog: VotingCryptographyInfoDialogService,
        dialog: PollDialogService
    ) {
        super(dialog, votingPrivacyDialog, votingCryptoInfoDialog);
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
            console.log(`Can't print ballots (yet)`);
        } catch (e) {
            console.error(e);
            this.raiseError(e);
        }
    }

    public downloadPdf(): void {
        this.pdfService.printBallots(this.poll);
    }

    public getDetailLink(): string {
        return `/${this.poll.meeting_id}/topics/polls/${this.poll.sequential_number}`;
    }
}
