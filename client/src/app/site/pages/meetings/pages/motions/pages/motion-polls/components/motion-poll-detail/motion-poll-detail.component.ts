import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Permission } from 'src/app/domain/definitions/permission';
import {
    BasePollDetailComponent,
    BaseVoteData
} from 'src/app/site/pages/meetings/modules/poll/base/base-poll-detail.component';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';

import { MotionPollService } from '../../../../modules/motion-poll/services';
import { MotionPollDialogService } from '../../../../modules/motion-poll/services/motion-poll-dialog.service';
import { MotionPollPdfService } from '../../../../modules/motion-poll/services/motion-poll-pdf.service';

export interface ExtendedVoteData extends BaseVoteData {
    vote_verbose_translated?: string | null;
}

@Component({
    selector: `os-motion-poll-detail`,
    templateUrl: `./motion-poll-detail.component.html`,
    styleUrls: [`./motion-poll-detail.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class MotionPollDetailComponent extends BasePollDetailComponent<ViewMotion, MotionPollService> {
    public filterPropsSingleVotesTable = [`user.full_name`, `valueVerbose`, `vote_verbose_translated`];

    public get showResults(): boolean {
        return this.hasPerms() || this.poll.isPublished;
    }

    public displayVoteWeight: boolean;

    public displayDelegation: boolean;

    public get canManagePoll(): boolean {
        return this.operator.hasPerms(Permission.motionCanManagePolls);
    }

    public constructor(
        protected override translate: TranslateService,
        pollService: MotionPollService,
        private pollDialog: MotionPollDialogService,
        pollPdfService: MotionPollPdfService
    ) {
        super(pollService, pollPdfService);
        this.subscriptions.push(this.voteWeightEnabled.subscribe(data => (this.displayVoteWeight = data)));
        this.subscriptions.push(this.delegationEnabled.subscribe(data => (this.displayDelegation = data)));
    }

    protected createVotesData(): ExtendedVoteData[] {
        const voteData = this.poll?.options[0]?.votes;
        const extendedVoteData: ExtendedVoteData[] = this.poll?.options[0]?.votes;
        if (extendedVoteData) {
            extendedVoteData.map(
                (element, index) =>
                    (element.vote_verbose_translated = this.translate.instant(voteData[index].vote.valueVerbose))
            );
        }
        return extendedVoteData;
    }

    public openDialog(): void {
        this.pollDialog.open(this.poll);
    }

    protected onDeleted(): void {
        this.router.navigateByUrl(this.poll.getDetailStateUrl());
    }

    protected hasPerms(): boolean {
        return this.operator.hasPerms(Permission.motionCanManagePolls);
    }
}
