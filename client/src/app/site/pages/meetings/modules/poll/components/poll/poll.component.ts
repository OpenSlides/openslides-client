import { Component, computed, inject, input, output, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { PollState, PollVisibility } from '@app/domain/models/poll';
import { infoDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { idFromFqid } from '@app/infrastructure/utils/transform-functions';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { OperatorService } from '@app/site/services/operator.service';
import { DirectivesModule } from '@app/ui/directives';
import { IconContainerComponent } from '@app/ui/modules/icon-container';
import { PromptService } from '@app/ui/modules/prompt-dialog';
import { TranslateKeyPipe } from '@app/ui/pipes/translate-key/translate-key.pipe';
import { TranslatePipe } from '@ngx-translate/core';

import { BaseMeetingComponent } from '../../../../base/base-meeting.component';
import { ProjectorButtonModule } from '../../../meetings-component-collector/projector-button/projector-button.module';
import { PollBallotPdfService } from '../../services/poll-ballot-pdf.service';
import { PollControllerService } from '../../services/poll-controller.service/poll-controller.service';
import { PollMetaComponent } from '../poll-meta/poll-meta.component';
import { PollProgressComponent } from '../poll-progress/poll-progress.component';
import { PollResultComponent } from '../poll-result/poll-result.component';
import { PollStopDialog } from '../poll-stop-dialog/poll-stop-dialog.component';
import { PollVoteComponent } from '../poll-vote/poll-vote.component';
import { VotingPrivacyWarningDialogComponent } from '../voting-privacy-warning/voting-privacy-warning-dialog.component';

interface PollStateAction {
    icon: string;
    css: string;
}

@Component({
    selector: 'os-poll',
    imports: [
        PollVoteComponent,
        PollProgressComponent,
        PollResultComponent,
        PollMetaComponent,
        IconContainerComponent,
        ProjectorButtonModule,
        TranslatePipe,
        TranslateKeyPipe,
        DirectivesModule,
        RouterLink,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule
    ],
    templateUrl: './poll.component.html',
    styleUrl: './poll.component.scss'
})
export class PollComponent extends BaseMeetingComponent {
    public poll = input.required<ViewPoll>();

    public allowEdit = input<boolean>(false);
    public navigateTo = input<`poll` | `content_object` | null>(null);

    public dialogOpened = output<void>();

    public anonymizePending = signal(false);
    public stateChangePending = signal(false);

    public isSameMeeting = computed(() => {
        return this.poll().meeting_id === this.currentMeetingId();
    });

    public getDetailLink = computed(() => {
        if (this.navigateTo() === `poll`) {
            return `/${this.poll().meeting_id}/polls/${this.poll().id}`;
        } else if (this.navigateTo() === `content_object`) {
            if (this.poll().isMotionPoll) {
                return `/${this.poll().meeting_id}/motions/${idFromFqid(this.poll().content_object_id)}`;
            } else if (this.poll().isAssignmentPoll) {
                return `/${this.poll().meeting_id}/assignments/${idFromFqid(this.poll().content_object_id)}`;
            } else if (this.poll().isTopicPoll) {
                return `/${this.poll().meeting_id}/topics/${idFromFqid(this.poll().content_object_id)}`;
            }
        }

        return null;
    });

    public pollStateAction: Signal<PollStateAction | null> = computed(() => {
        return this.pollStateActions[this.poll().state] ?? null;
    });

    public hideChangeState: Signal<boolean> = computed(() => {
        return this.poll().isPublished || (this.poll().isCreated && this.poll().visibility === PollVisibility.Manually);
    });

    private pollStateActions: Record<PollState, PollStateAction> = {
        [PollState.Created]: {
            icon: `play_arrow`,
            css: `start-poll-button`
        },
        [PollState.Started]: {
            icon: `stop`,
            css: `stop-poll-button`
        },
        [PollState.Finished]: {
            icon: `public`,
            css: `publish-poll-button`
        }
    };

    private operator = inject(OperatorService);
    private promptService = inject(PromptService);
    private repo = inject(PollControllerService);
    private dialog = inject(MatDialog);
    private pollPdf = inject(PollBallotPdfService);

    public user = toSignal(this.operator.userObservable);
    public currentMeetingId = toSignal(this.activeMeetingIdService.meetingIdObservable);
    public voteDelegationEnabled = toSignal(this.meetingSettingsService.get(`users_enable_vote_delegations`));

    public delegations = computed(() => {
        return this.user().vote_delegations_from();
    });

    public openVotingWarning(): void {
        this.dialog.open(VotingPrivacyWarningDialogComponent, infoDialogSettings);
    }

    public async downloadPdf(): Promise<void> {
        this.pollPdf.downloadBallotPaper(this.poll());
    }

    public async anonymizePoll(): Promise<void> {
        this.anonymizePending.set(true);
        const title = this.translate.instant(`Are you sure you want to anonymize all votes? This cannot be undone.`);
        if (await this.promptService.open(title)) {
            this.repo.anonymize(this.poll()).catch(this.raiseError);
        }
        this.anonymizePending.set(false);
    }

    public async resetState(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to reset this vote?`);
        const content = this.translate.instant(`All votes will be lost.`);
        if (await this.promptService.open(title, content)) {
            this.changeState(PollState.Created);
        }
    }

    public async deletePoll(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this vote?`);
        const content = this.poll().getTitle();
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(this.poll());
        }
    }

    public async nextPollState(): Promise<void> {
        const currentState: PollState = this.poll().state;
        if (currentState === PollState.Created || currentState === PollState.Finished) {
            if (this.poll().nextState !== `published`) {
                await this.changeState(this.poll().nextState as PollState);
            } else {
                this.repo.publish(this.poll());
            }
        } else if (currentState === PollState.Started) {
            const dialogRef = this.dialog.open(PollStopDialog, {
                data: { poll: this.poll() }
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result !== undefined) {
                    this.repo.finalize(this.poll(), result).catch(this.raiseError);
                }
            });
        }
    }

    private async changeState(targetState: PollState): Promise<void> {
        this.stateChangePending.set(true);
        await this.repo.changePollState(this.poll(), targetState).catch(this.raiseError);
        this.stateChangePending.set(false);
    }
}
