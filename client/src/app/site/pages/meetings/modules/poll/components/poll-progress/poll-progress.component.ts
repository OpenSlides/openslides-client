import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';
import { map } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { PollClassType } from 'src/app/domain/models/poll';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { AutoupdateService } from 'src/app/site/services/autoupdate';
import { ModelRequestBuilderService } from 'src/app/site/services/model-request-builder';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { getParticipantVoteInfoSubscriptionConfig } from '../../../../pages/participants/participants.subscription';
import { ActiveMeetingService } from '../../../../services/active-meeting.service';

@Component({
    selector: `os-poll-progress`,
    templateUrl: `./poll-progress.component.html`,
    imports: [MatProgressBarModule, TranslateModule],
    styleUrls: [`./poll-progress.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollProgressComponent extends BaseUiComponent {
    public poll = input.required<ViewPoll>();

    public canManagePoll = computed(() => {
        if (this.poll().pollClassType === PollClassType.Motion) {
            return this.operator.hasPerms(Permission.motionCanManagePolls);
        } else if (this.poll().pollClassType === PollClassType.Assignment) {
            return this.operator.hasPerms(Permission.assignmentCanManagePolls);
        } else if (this.poll().pollClassType === PollClassType.Topic) {
            return this.operator.hasPerms(Permission.pollCanManage);
        }
        return false;
    });

    public votescast = computed(() => {
        return Object.keys(this.poll().live_votes ?? {}).length;
    });

    public canSeeProgressBar = computed(() => {
        if (!this.canSeeNames) {
            return false;
        }
        return this.canManageSpeakers || this.canManagePoll();
    });

    public valueInPercent = computed(() => {
        return (this.votescast() / this.max()) * 100;
    });

    private canSeeNames = signal(false);
    private canManageSpeakers = signal(false);

    private autoupdate = inject(AutoupdateService);
    private userRepo = inject(UserControllerService);
    private operator = inject(OperatorService);
    private activeMeeting = inject(ActiveMeetingService);
    private modelRequestBuilder = inject(ModelRequestBuilderService);

    public maxResource = rxResource({
        params: () => ({ entitledGroupIds: this.poll().entitled_group_ids }),

        stream: ({ params }) =>
            this.userRepo.getViewModelListObservable().pipe(
                map(users => {
                    /**
                     * Filter the users who would be able to vote:
                     * They are present and don't have their vote right delegated
                     * or the have their vote delegated to a user who is present.
                     * They are in one of the voting groups
                     */
                    return users.filter(user => {
                        const countable = user.isVoteCountable;
                        const inVoteGroup = params.entitledGroupIds.intersect(user.group_ids()).length;

                        return countable && inVoteGroup;
                    }).length;
                })
            )
    });

    public max = computed(() => {
        return this.maxResource.hasValue() ? this.maxResource.value() : 1;
    });

    public constructor() {
        super();

        effect(() => {
            if (this.canSeeProgressBar()) {
                const subscriptionConfig = getParticipantVoteInfoSubscriptionConfig(this.activeMeeting.meetingId);
                this.modelRequestBuilder.build(subscriptionConfig.modelRequest).then(modelRequest => {
                    this.autoupdate.subscribe(modelRequest, subscriptionConfig.subscriptionName);
                });
            }
        });

        this.operator.userObservable.pipe(takeUntilDestroyed()).subscribe(() => {
            this.canSeeNames.set(this.operator.hasPerms(Permission.userCanSee));
            this.canManageSpeakers.set(this.operator.hasPerms(Permission.listOfSpeakersCanManage));
        });
    }
}
