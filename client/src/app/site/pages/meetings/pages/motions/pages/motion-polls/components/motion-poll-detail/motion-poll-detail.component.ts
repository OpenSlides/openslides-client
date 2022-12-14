import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Permission } from 'src/app/domain/definitions/permission';
import {
    BasePollDetailComponent,
    BaseVoteData
} from 'src/app/site/pages/meetings/modules/poll/base/base-poll-detail.component';
import { PollDialogService } from 'src/app/site/pages/meetings/modules/poll/services/poll-dialog.service';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';

import { MotionPollService } from '../../../../modules/motion-poll/services';
import { MotionPollDialogService } from '../../../../modules/motion-poll/services/motion-poll-dialog.service';
import { MotionPollPdfService } from '../../../../modules/motion-poll/services/motion-poll-pdf.service';

@Component({
    selector: `os-motion-poll-detail`,
    templateUrl: `./motion-poll-detail.component.html`,
    styleUrls: [`./motion-poll-detail.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class MotionPollDetailComponent extends BasePollDetailComponent<ViewMotion, MotionPollService> {
    public filterPropsSingleVotesTable = [`user.full_name`, `valueVerbose`];

    public get showResults(): boolean {
        return this.hasPerms() || this.poll.isPublished;
    }

    public constructor(
        protected override translate: TranslateService,
        pollService: MotionPollService,
        private pollDialog: MotionPollDialogService,
        pollPdfService: MotionPollPdfService,
        dialog: PollDialogService
    ) {
        super(pollService, pollPdfService, dialog);
    }

    protected createVotesData(): BaseVoteData[] {
        return this.poll?.options[0]?.votes;
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
