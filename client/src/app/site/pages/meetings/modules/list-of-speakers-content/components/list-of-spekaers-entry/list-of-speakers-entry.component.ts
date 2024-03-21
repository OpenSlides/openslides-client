import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { SpeakerState } from 'src/app/domain/models/speakers/speaker-state';
import { SPECIAL_SPEECH_STATES, SpeechState } from 'src/app/domain/models/speakers/speech-state';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewSpeaker } from 'src/app/site/pages/meetings/pages/agenda';
import { ListOfSpeakersControllerService } from 'src/app/site/pages/meetings/pages/agenda/modules/list-of-speakers/services/list-of-speakers-controller.service';
import { SpeakerControllerService } from 'src/app/site/pages/meetings/pages/agenda/modules/list-of-speakers/services/speaker-controller.service';
import { InteractionService } from 'src/app/site/pages/meetings/pages/interaction/services/interaction.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';
import { SortingListComponent } from 'src/app/ui/modules/sorting/modules/sorting-list/components/sorting-list/sorting-list.component';

import {
    getLosFirstContributionSubscriptionConfig,
    LOS_FIRST_CONTRIBUTION_SUBSCRIPTION
} from '../../list-of-speakers-content.subscription';
import { PointOfOrderDialogService } from '../../modules/point-of-order-dialog/services/point-of-order-dialog.service';
import { SpeakerUserSelectDialogService } from '../../modules/speaker-user-select-dialog/services/speaker-user-select-dialog.service';

@Component({
    selector: `os-list-of-speakers-entry`,
    templateUrl: `./list-of-speakers-entry.component.html`,
    styleUrls: [`./list-of-speakers-entry.component.scss`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListOfSpeakersEntryComponent extends BaseMeetingComponent implements OnInit {
    public readonly SpeechState = SpeechState;

    @ViewChild(SortingListComponent)
    public listElement!: SortingListComponent;

    @Input({ required: true })
    public speaker: ViewSpeaker;

    @Input()
    public showcolor = false;

    @Output()
    public startSpeech = new EventEmitter<void>();

    @Output()
    public pauseSpeech = new EventEmitter<void>();

    @Output()
    public stopSpeech = new EventEmitter<void>();

    public get showFirstContributionHintObservable(): Observable<boolean> {
        return this.meetingSettingsService.get(`list_of_speakers_show_first_contribution`);
    }

    public get showInterposedQuestions(): Observable<boolean> {
        return this.meetingSettingService.get(`list_of_speakers_enable_interposed_question`);
    }

    public get showSpeakerNoteForEveryoneObservable(): Observable<boolean> {
        return this.meetingSettingsService.get(`list_of_speakers_speaker_note_for_everyone`);
    }

    public get hideSecondaryContributionsCount(): Observable<boolean> {
        return this.meetingSettingsService.get(`list_of_speakers_hide_contribution_count`);
    }

    public get canManage(): boolean {
        return this.operator.hasPerms(this.permission.listOfSpeakersCanManage);
    }

    public get canSee(): boolean {
        return this.operator.hasPerms(this.permission.listOfSpeakersCanSee);
    }

    public get enableCallControls(): boolean {
        return this.canManage && this.isCallEnabled;
    }

    public isPointOfOrderFn = () => this.speaker.point_of_order;

    public isCallEnabled = false;
    public pointOfOrderCategoriesEnabled = false;
    public enableProContraSpeech = false;
    public enableMultipleParticipants = false;
    public pointOfOrderEnabled = false;
    public structureLevelCountdownEnabled = false;

    private pointOfOrderForOthersEnabled = false;
    private interventionEnabled = false;

    private canMarkSelf = false;

    public constructor(
        protected override translate: TranslateService,
        private listOfSpeakersRepo: ListOfSpeakersControllerService,
        private speakerRepo: SpeakerControllerService,
        public operator: OperatorService,
        private promptService: PromptService,
        private dialog: PointOfOrderDialogService,
        private speakerUserSelectDialog: SpeakerUserSelectDialogService,
        private interactionService: InteractionService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.subscribeToSettings();
        this.subscriptions.push(
            // observe changes to the viewport
            this.showFirstContributionHintObservable.subscribe(showFirstContribution => {
                if (showFirstContribution) {
                    this.modelRequestService.subscribeTo({
                        ...getLosFirstContributionSubscriptionConfig(this.activeMeetingId),
                        hideWhen: this.activeMeetingIdService.meetingIdObservable.pipe(map(id => !id))
                    });
                } else {
                    this.modelRequestService.closeSubscription(LOS_FIRST_CONTRIBUTION_SUBSCRIPTION);
                }
            })
        );
    }

    /**
     * Click on the X button - removes the speaker from the list of speakers
     *
     * @param speaker optional speaker to remove. If none is given,
     * the operator themself is removed
     */
    public async removeSpeaker(): Promise<void> {
        const title = this.speaker
            ? this.translate.instant(`Are you sure you want to remove this speaker from the list of speakers?`)
            : this.translate.instant(`Are you sure you want to remove yourself from this list of speakers?`);
        if (this.speaker && (await this.promptService.open(title))) {
            await this.speakerRepo.delete(this.speaker.id);
            if (this.speaker.user) {
                this.interactionService.kickUsers([this.speaker.user], `Removed from the list of speakers`);
            }
        }
    }

    public async updateSpeakerMeetingUser(): Promise<boolean> {
        const dialogRef = await this.speakerUserSelectDialog.open(this.speaker.list_of_speakers);
        try {
            const result = await firstValueFrom(dialogRef.afterClosed());
            if (result) {
                if (result.meeting_user_id) {
                    await this.speakerRepo.setMeetingUser(
                        this.speaker,
                        result.meeting_user_id,
                        this.structureLevelCountdownEnabled ? result.structure_level_id : undefined
                    );
                }
                return true;
            }
        } catch (e) {
            this.raiseError(e);
            throw e;
        }

        return false;
    }

    public enableSpeechStateControls(): boolean {
        return (
            this.speaker.speech_state !== SpeechState.INTERPOSED_QUESTION &&
            (!this.speaker.isSpeaking || this.speaker.speech_state !== SpeechState.INTERVENTION)
        );
    }

    public enableProContraButton(): boolean {
        return (
            this.enableProContraSpeech &&
            (!this.speaker.isSpeaking || !SPECIAL_SPEECH_STATES.includes(this.speaker.speech_state))
        );
    }

    public enableContributionButton(): boolean {
        return !this.speaker.isSpeaking || !SPECIAL_SPEECH_STATES.includes(this.speaker.speech_state);
    }

    public enableInterventionButton(): boolean {
        return this.interventionEnabled && !this.speaker.isSpeaking;
    }

    public enablePointOfOrderButton(): boolean {
        return (
            this.pointOfOrderEnabled &&
            (this.speaker.meeting_user?.user.id === this.operator.user.id || this.pointOfOrderForOthersEnabled) &&
            (!this.speaker.isSpeaking || !this.speaker.structure_level_list_of_speakers_id)
        );
    }

    public enableUpdateUserButton(): boolean {
        return this.speaker.speech_state === SpeechState.INTERPOSED_QUESTION && !this.speaker.meeting_user_id;
    }

    public showStructureLevels(): boolean {
        return (
            this.structureLevelCountdownEnabled &&
            this.speaker.isWaiting &&
            this.speaker.meeting_user_id &&
            this.speaker.meeting_user.structure_levels?.length > 0
        );
    }

    public enableStructureLevelsMenu(): boolean {
        return this.canManage && this.showStructureLevels();
    }

    /**
     * Click on the mic button to mark a speaker as speaking
     *
     * @param speaker the speaker selected in one list of speakers
     */
    public async onStartButton(): Promise<void> {
        this.startSpeech.emit();
    }

    /**
     * Click on the mic-cross button to stop the current speaker
     */
    public async onPauseButton(): Promise<void> {
        this.pauseSpeech.emit();
    }

    /**
     * Click on the mic-cross button to stop the current speaker
     */
    public async onStopButton(): Promise<void> {
        this.stopSpeech.emit();
    }

    public isSpeakerOperator(): boolean {
        return this.operator.operatorId === this.speaker.user_id;
    }

    public canMarkSpeaker(): boolean {
        return this.canManage || (this.canMarkSelf && this.isSpeakerOperator());
    }

    /**
     * Click on the star button. Toggles the marked attribute.
     *
     * @param speaker The speaker clicked on.
     */
    public async onMarkButton(): Promise<void> {
        await this.speakerRepo.setContribution(this.speaker);
    }

    public async onInterventionButton(): Promise<void> {
        await this.speakerRepo.setIntervention(this.speaker);
    }

    public async onProContraButtons(isProSpeech: boolean): Promise<void> {
        if (isProSpeech) {
            await this.speakerRepo.setProSpeech(this.speaker);
        } else {
            await this.speakerRepo.setContraSpeech(this.speaker);
        }
    }

    public async onPointOfOrderButton(): Promise<void> {
        if (!this.speaker.point_of_order && this.pointOfOrderCategoriesEnabled) {
            const dialogRef = await this.dialog.open();
            const result = await firstValueFrom(dialogRef.afterClosed());
            if (result) {
                await this.speakerRepo.setPointOfOrder(this.speaker, {
                    point_of_order: true,
                    ...result
                });
            }
        } else {
            await this.speakerRepo.setPointOfOrder(this.speaker, {
                point_of_order: !this.speaker.point_of_order
            });
        }
    }

    public async onEditPointOfOrderButton(): Promise<void> {
        const dialogRef = await this.dialog.open(this.speaker);
        const result = await firstValueFrom(dialogRef.afterClosed());
        if (result) {
            await this.speakerRepo.setPointOfOrder(this.speaker, result);
        }
    }

    public inviteToVoice(): void {
        this.interactionService.inviteToCall(this.speaker.userId);
    }

    public async setStructureLevel(structureLevel: Id): Promise<void> {
        if (structureLevel === this.speaker.structure_level_list_of_speakers?.structure_level_id) {
            structureLevel = null;
        }

        await this.speakerRepo.setStructureLevel(this.speaker, structureLevel);
    }

    /**
     * Checks how often a speaker has already finished speaking
     *
     * @param speaker
     * @returns 0 or the number of times a speaker occurs in finishedSpeakers
     */
    public hasSpokenCount(): number {
        return this.speaker.list_of_speakers.speakers.filter(
            speaker =>
                speaker.state === SpeakerState.FINISHED &&
                speaker.user_id === this.speaker.user_id &&
                !speaker.point_of_order
        ).length;
    }

    /**
     * Returns true if the speaker did never appear on any list of speakers
     *
     * @param speaker
     */
    public isFirstContribution(): boolean {
        return this.listOfSpeakersRepo.isFirstContribution(this.speaker);
    }

    public getSpeakerCountdown(): any {
        if (this.speaker.speech_state === SpeechState.INTERPOSED_QUESTION) {
            const total_pause = this.speaker.total_pause || 0;
            const end = this.speaker.pause_time || this.speaker.end_time || 0;
            return {
                running: this.speaker.isSpeaking,
                default_time: 0,
                countdown_time: this.speaker.isSpeaking
                    ? this.speaker.begin_time + total_pause
                    : (end - (this.speaker.begin_time + total_pause) || 0) * -1
            };
        } else if (this.interventionEnabled && this.speaker.speech_state === SpeechState.INTERVENTION) {
            const default_time = this.meetingSettingsService.instant(`list_of_speakers_intervention_time`) || 0;
            const total_pause = this.speaker.total_pause || 0;
            const end = this.speaker.pause_time || this.speaker.end_time || 0;
            const countdown_time = this.speaker.isSpeaking
                ? this.speaker.begin_time + total_pause + default_time
                : (end - (this.speaker.begin_time + total_pause + default_time)) * -1;
            return {
                running: this.speaker.isSpeaking,
                default_time,
                countdown_time: this.speaker.begin_time ? countdown_time : default_time
            };
        } else if (
            this.structureLevelCountdownEnabled &&
            this.speaker.structure_level_list_of_speakers &&
            !this.speaker.point_of_order
        ) {
            const speakingTime = this.speaker.structure_level_list_of_speakers;
            const remaining = speakingTime.remaining_time;
            return {
                running: !!speakingTime.current_start_time,
                countdown_time: speakingTime.current_start_time
                    ? speakingTime.current_start_time + remaining
                    : remaining
            };
        }

        return null;
    }

    private subscribeToSettings(): void {
        this.subscriptions.push(
            this.meetingSettingsService.get(`list_of_speakers_enable_point_of_order_categories`).subscribe(enabled => {
                this.pointOfOrderCategoriesEnabled = enabled;
            }),
            // observe changes to the agenda_show_first_contribution setting
            // observe point of order settings
            this.meetingSettingsService.get(`list_of_speakers_enable_point_of_order_speakers`).subscribe(show => {
                this.pointOfOrderEnabled = show;
            }),
            this.meetingSettingsService
                .get(`list_of_speakers_can_create_point_of_order_for_others`)
                .subscribe(canCreate => {
                    this.pointOfOrderForOthersEnabled = canCreate;
                }),
            this.meetingSettingsService.get(`list_of_speakers_enable_pro_contra_speech`).subscribe(enabled => {
                this.enableProContraSpeech = enabled;
            }),
            this.meetingSettingsService.get(`list_of_speakers_can_set_contribution_self`).subscribe(canSet => {
                this.canMarkSelf = canSet;
            }),
            this.meetingSettingsService.get(`list_of_speakers_allow_multiple_speakers`).subscribe(multiple => {
                this.enableMultipleParticipants = multiple;
            }),
            this.meetingSettingsService.get(`list_of_speakers_intervention_time`).subscribe(time => {
                this.interventionEnabled = time > 0;
            }),
            this.interactionService.showLiveConfObservable.subscribe(show => {
                this.isCallEnabled = show;
            }),
            this.meetingSettingsService.get(`list_of_speakers_default_structure_level_time`).subscribe(time => {
                this.structureLevelCountdownEnabled = time > 0;
            })
        );
    }
}
