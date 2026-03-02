import { ChangeDetectionStrategy, Component, computed, inject, input, output, Signal, signal } from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PollState, PollVisibility } from 'src/app/domain/models/poll';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChoiceService } from 'src/app/ui/modules/choice-dialog';
import { IconContainerComponent } from 'src/app/ui/modules/icon-container';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { BaseMeetingComponent } from '../../../../base/base-meeting.component';
import { ViewPoll } from '../../../../pages/polls';
import { ProjectorButtonModule } from '../../../meetings-component-collector/projector-button/projector-button.module';
import { VotingPrivacyWarningDialogService } from '../../modules/voting-privacy-dialog/services/voting-privacy-warning-dialog.service';
import { PollControllerService } from '../../services/poll-controller.service';
import { PollProgressComponent } from '../poll-progress/poll-progress.component';

interface PollStateAction {
    icon: string;
    css: string;
}

@Component({
    selector: 'os-poll-vote',
    imports: [
        PollProgressComponent,
        IconContainerComponent,
        ProjectorButtonModule,
        TranslatePipe,
        DirectivesModule,
        RouterLink,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule
    ],
    templateUrl: './poll-vote.component.html',
    styleUrl: './poll-vote.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollVoteComponent extends BaseMeetingComponent {
    public poll = input.required<ViewPoll>();

    public dialogOpened = output<void>();
    public downloadPdf = output<void>();

    public stateChangePending = signal(true);

    public currentMeetingId = toSignal(this.activeMeetingIdService.meetingIdObservable);
    public isSameMeeting = computed(() => {
        return this.poll().meeting_id === this.currentMeetingId();
    });

    public pollStateAction: Signal<PollStateAction | null> = computed(() => {
        return this.pollStateActions[this.poll().state] ?? null;
    });

    public hideChangeState: Signal<boolean> = computed(() => {
        return this.poll().isPublished || (this.poll().isCreated && this.poll().visibility === PollVisibility.Manually);
    });

    public getDetailLink(): string {
        return ``;
    }

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

    private promptService = inject(PromptService);
    private choiceService = inject(ChoiceService);
    private repo = inject(PollControllerService);
    private votingPrivacyDialog = inject(VotingPrivacyWarningDialogService);

    public openVotingWarning(): void {
        this.votingPrivacyDialog.open();
    }

    public async pseudoanonymizePoll(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to anonymize all votes? This cannot be undone.`);
        if (await this.promptService.open(title)) {
            this.repo.anonymize(this.poll()).catch(this.raiseError);
        }
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
            const title = this.translate.instant(`Are you sure you want to stop this voting?`);
            const STOP_LABEL = this.translate.instant(`Stop`);
            const STOP_PUBLISH_LABEL = this.translate.instant(`Stop & publish`);
            const STOP_PUBLISH_ANONYMIZE_LABEL = this.translate.instant(`Stop, publish & anonymize`);
            const actions = [STOP_LABEL, STOP_PUBLISH_LABEL];
            if (this.poll().live_voting_enabled) {
                actions.push(STOP_PUBLISH_ANONYMIZE_LABEL);
            }
            const choice = await this.choiceService.open({ title, multiSelect: false, actions });

            if (choice?.action === STOP_LABEL) {
                await this.changeState(PollState.Finished);
            } else if (choice?.action === STOP_PUBLISH_LABEL) {
                await this.repo.publish(this.poll()).catch(this.raiseError);
            } else if (choice?.action === STOP_PUBLISH_ANONYMIZE_LABEL) {
                await this.repo.anonymize(this.poll(), true).catch(this.raiseError);
            }
        }
    }

    private async changeState(targetState: PollState): Promise<void> {
        this.stateChangePending.set(true);
        await this.repo.changePollState(this.poll(), targetState).catch(this.raiseError);
        this.stateChangePending.set(false);
    }
}
