import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PblColumnDefinition } from '@pebula/ngrid';

import { OperatorService } from 'app/core/core-services/operator.service';
import { MotionPollRepositoryService } from 'app/core/repositories/motions/motion-poll-repository.service';
import { MotionVoteRepositoryService } from 'app/core/repositories/motions/motion-vote-repository.service';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionPoll } from 'app/site/motions/models/view-motion-poll';
import { MotionPollDialogService } from 'app/site/motions/services/motion-poll-dialog.service';
import { MotionPollService } from 'app/site/motions/services/motion-poll.service';
import { BasePollDetailComponent } from 'app/site/polls/components/base-poll-detail.component';

@Component({
    selector: 'os-motion-poll-detail',
    templateUrl: './motion-poll-detail.component.html',
    styleUrls: ['./motion-poll-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class MotionPollDetailComponent extends BasePollDetailComponent<ViewMotionPoll, MotionPollService> {
    public motion: ViewMotion;
    public columnDefinition: PblColumnDefinition[] = [
        {
            prop: 'user',
            width: 'auto',
            label: 'Participant'
        },
        {
            prop: 'vote',
            width: 'auto',
            label: 'Vote'
        }
    ];

    public filterProps = ['user.getFullName', 'valueVerbose'];

    public isVoteWeightActive: boolean;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        repo: MotionPollRepositoryService,
        route: ActivatedRoute,
        groupRepo: GroupRepositoryService,
        prompt: PromptService,
        pollDialog: MotionPollDialogService,
        pollService: MotionPollService,
        votesRepo: MotionVoteRepositoryService,
        private operator: OperatorService,
        private router: Router
    ) {
        super(componentServiceCollector, repo, route, groupRepo, prompt, pollDialog, pollService, votesRepo);
        // TODO: Get this from the active meeting.
        // TODO: refactor this into the BasePollDetailComponent and also remove from assignment-poll-detail
        /*configService
            .get<boolean>('users_activate_vote_weight')
            .subscribe(active => (this.isVoteWeightActive = active));
        */
       console.warn("TODO: assignment-poll-detail.component")
    }

    protected createVotesData(): void {
        this.setVotesData(this.poll.options[0].votes);
    }

    public openDialog(): void {
        this.pollDialog.openDialog(this.poll);
    }

    protected onDeleted(): void {
        this.router.navigate(['motions', this.poll.motion_id]);
    }

    protected hasPerms(): boolean {
        return this.operator.hasPerms('motions.can_manage_polls');
    }
}
