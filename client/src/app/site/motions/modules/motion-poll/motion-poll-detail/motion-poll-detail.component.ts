import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PblColumnDefinition } from '@pebula/ngrid';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { VoteRepositoryService } from 'app/core/repositories/polls/vote-repository.service';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { MotionPollService } from 'app/site/motions/services/motion-poll.service';
import { MotionPollDialogService } from 'app/site/motions/services/motion-poll-dialog.service';
import { BasePollDetailComponentDirective } from 'app/site/polls/components/base-poll-detail.component';

@Component({
    selector: `os-motion-poll-detail`,
    templateUrl: `./motion-poll-detail.component.html`,
    styleUrls: [`./motion-poll-detail.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class MotionPollDetailComponent extends BasePollDetailComponentDirective<
    ViewPoll<ViewMotion>,
    MotionPollService
> {
    public motion: ViewMotion;
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

    public filterPropsSingleVotesTable = [`user.getFullName`, `valueVerbose`];

    public get showResults(): boolean {
        return this.hasPerms() || this.poll.isPublished;
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        repo: PollRepositoryService,
        route: ActivatedRoute,
        groupRepo: GroupRepositoryService,
        promptService: PromptService,
        pollDialog: MotionPollDialogService,
        pollService: MotionPollService,
        votesRepo: VoteRepositoryService,
        operator: OperatorService,
        cd: ChangeDetectorRef,
        meetingSettingsService: MeetingSettingsService,
        userRepo: UserRepositoryService,
        private router: Router
    ) {
        super(
            componentServiceCollector,
            translate,
            repo,
            route,
            groupRepo,
            promptService,
            pollDialog,
            pollService,
            votesRepo,
            operator,
            cd,
            meetingSettingsService,
            userRepo
        );
    }

    protected createVotesData(): void {
        this.setVotesData(this.poll?.options[0]?.votes);
    }

    public openDialog(): void {
        this.pollDialog.openDialog(this.poll);
    }

    protected onDeleted(): void {
        this.router.navigateByUrl(this.poll.getContentObjectDetailStateURL());
    }

    protected hasPerms(): boolean {
        return this.operator.hasPerms(Permission.motionCanManagePolls);
    }
}
