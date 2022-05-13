import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import {
    BasePollDetailComponent,
    BaseVoteData
} from 'src/app/site/pages/meetings/modules/poll/base/base-poll-detail.component';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { MotionPollService } from '../../../../modules/motion-poll/services';
import { PblColumnDefinition } from '@pebula/ngrid';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service/poll-controller.service';
import { TranslateService } from '@ngx-translate/core';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { ActivatedRoute } from '@angular/router';
import { GroupControllerService } from '../../../../../participants/modules/groups/services/group-controller.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';
import { VoteControllerService } from '../../../../../../modules/poll/services/vote-controller.service/vote-controller.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service';
import { Permission } from 'src/app/domain/definitions/permission';
import { MotionPollDialogService } from '../../../../modules/motion-poll/services/motion-poll-dialog.service';

@Component({
    selector: 'os-motion-poll-detail',
    templateUrl: './motion-poll-detail.component.html',
    styleUrls: ['./motion-poll-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class MotionPollDetailComponent extends BasePollDetailComponent<ViewMotion, MotionPollService> {
    public columnDefinitionSingleVotesTable: PblColumnDefinition[] = [
        {
            prop: `user`,
            width: `50%`,
            label: `Participant`
        },
        {
            prop: `vote`,
            width: `50%`,
            label: `Vote`
        }
    ];

    public filterPropsSingleVotesTable = [`user.full_name`, `valueVerbose`];

    public get showResults(): boolean {
        return this.hasPerms() || this.poll.isPublished;
    }

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        repo: PollControllerService,
        route: ActivatedRoute,
        groupRepo: GroupControllerService,
        promptService: PromptService,
        pollService: MotionPollService,
        votesRepo: VoteControllerService,
        operator: OperatorService,
        cd: ChangeDetectorRef,
        participantRepo: ParticipantControllerService,
        private pollDialog: MotionPollDialogService
    ) {
        super(
            componentServiceCollector,
            translate,
            repo,
            route,
            groupRepo,
            promptService,
            pollService,
            votesRepo,
            operator,
            cd,
            participantRepo
        );
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
