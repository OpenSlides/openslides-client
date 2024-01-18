import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    EventEmitter,
    Input,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Selectable } from 'src/app/domain/interfaces/selectable';
import { SpeakerState } from 'src/app/domain/models/speakers/speaker-state';
import { SpeechState } from 'src/app/domain/models/speakers/speech-state';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewListOfSpeakers, ViewSpeaker } from 'src/app/site/pages/meetings/pages/agenda';
import { ListOfSpeakersControllerService } from 'src/app/site/pages/meetings/pages/agenda/modules/list-of-speakers/services/list-of-speakers-controller.service';
import { SpeakerControllerService } from 'src/app/site/pages/meetings/pages/agenda/modules/list-of-speakers/services/speaker-controller.service';
import { InteractionService } from 'src/app/site/pages/meetings/pages/interaction/services/interaction.service';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service/participant-controller.service';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { DurationService } from 'src/app/site/services/duration.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';
import { SortingListComponent } from 'src/app/ui/modules/sorting/modules/sorting-list/components/sorting-list/sorting-list.component';

import { UserSelectionData } from '../../../participant-search-selector';
import { ListOfSpeakersContentTitleDirective } from '../../directives/list-of-speakers-content-title.directive';
import {
    getLosFirstContributionSubscriptionConfig,
    LOS_FIRST_CONTRIBUTION_SUBSCRIPTION
} from '../../list-of-speakers-content.subscription';
import { PointOfOrderDialogService } from '../../modules/point-of-order-dialog/services/point-of-order-dialog.service';
import { SpeakerUserSelectDialogService } from '../../modules/speaker-user-select-dialog/services/speaker-user-select-dialog.service';

@Component({
    selector: `os-list-of-speakers-content`,
    templateUrl: `./list-of-speakers-content.component.html`,
    styleUrls: [`./list-of-speakers-content.component.scss`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListOfSpeakersContentComponent extends BaseMeetingComponent implements OnInit {
    public readonly SpeechState = SpeechState;

    @ViewChild(SortingListComponent)
    public listElement!: SortingListComponent;

    @Input()
    public addBottomSpacer = false;

    public finishedSpeakers: ViewSpeaker[] = [];
    public waitingSpeakers: ViewSpeaker[] = [];
    public interposedQuestions: ViewSpeaker[] = [];
    public activeSpeaker: ViewSpeaker | null = null;

    public users: ViewUser[] = [];
    public nonAvailableUserIds: number[] = [];

    public isSortMode = false;

    public isMobile = false;

    public get showFirstContributionHintObservable(): Observable<boolean> {
        return this.meetingSettingsService.get(`list_of_speakers_show_first_contribution`);
    }

    public get showInterposedQuestions(): Observable<boolean> {
        return this.meetingSettingService.get(`list_of_speakers_enable_interposed_question`);
    }

    public get interventionEnabled(): Observable<boolean> {
        return this.meetingSettingService.get(`list_of_speakers_intervention_time`).pipe(map(v => v > 0));
    }

    public get structureLevelCountdownEnabled(): Observable<boolean> {
        return this.meetingSettingService.get(`list_of_speakers_default_structure_level_time`).pipe(map(v => v > 0));
    }

    public get showPointOfOrders(): boolean {
        return this.pointOfOrderEnabled && this.canAddDueToPresence;
    }

    public get showSpeakerNoteForEveryoneObservable(): Observable<boolean> {
        return this.meetingSettingsService.get(`list_of_speakers_speaker_note_for_everyone`);
    }

    public get title(): string {
        return this._listOfSpeakers?.getTitle() || ``;
    }

    public get closed(): boolean {
        return this._listOfSpeakers?.closed || false;
    }

    public get canManage(): boolean {
        return this.operator.hasPerms(this.permission.listOfSpeakersCanManage);
    }

    public get canSee(): boolean {
        return this.operator.hasPerms(this.permission.listOfSpeakersCanSee);
    }

    public get canAddDueToPresence(): boolean {
        return !this.onlyPresentUsers || this._currentUser!.isPresentInMeeting();
    }

    @Input()
    public set listOfSpeakers(los: ViewListOfSpeakers) {
        if (los) {
            this._listOfSpeakers = los;
            this.updateSpeakers();
        }
    }

    public get listOfSpeakers(): ViewListOfSpeakers {
        return this._listOfSpeakers!;
    }

    @ContentChild(ListOfSpeakersContentTitleDirective, { read: TemplateRef })
    public explicitTitleContent: TemplateRef<any> | null = null;

    @Input()
    public set sortMode(isActive: boolean) {
        if (this.isSortMode) {
            this.listElement.restore();
        }
        this.isSortMode = isActive;
    }

    public isCallEnabled: Observable<boolean> = this.interactionService.showLiveConfObservable;

    public pointOfOrderCategoriesEnabled = false;

    public restrictPointOfOrderActions = false;

    public isPointOfOrderFn = (speaker: ViewSpeaker) => speaker.point_of_order;
    public enableProContraSpeech = false;

    @Output()
    private isListOfSpeakersEmptyEvent = new EventEmitter<boolean>();

    @Output()
    private canReaddLastSpeakerEvent = new EventEmitter<boolean>();

    private _currentUser: ViewUser | null = null;

    private _listOfSpeakers: ViewListOfSpeakers | null = null;

    private pointOfOrderEnabled = false;

    private canMarkSelf = false;

    private get onlyPresentUsers(): boolean {
        return this.meetingSettingsService.instant(`list_of_speakers_present_users_only`) ?? false;
    }

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private listOfSpeakersRepo: ListOfSpeakersControllerService,
        private speakerRepo: SpeakerControllerService,
        private operator: OperatorService,
        private promptService: PromptService,
        private durationService: DurationService,
        private userRepository: ParticipantControllerService,
        private viewport: ViewPortService,
        private cd: ChangeDetectorRef,
        private dialog: PointOfOrderDialogService,
        private speakerUserSelectDialog: SpeakerUserSelectDialogService,
        private interactionService: InteractionService
    ) {
        super(componentServiceCollector, translate);

        this.subscriptions.push(
            this.meetingSettingsService
                .get(`list_of_speakers_enable_point_of_order_categories`)
                .subscribe(enabled => (this.pointOfOrderCategoriesEnabled = enabled)),
            this.meetingSettingsService
                .get(`list_of_speakers_closing_disables_point_of_order`)
                .subscribe(enabled => (this.restrictPointOfOrderActions = enabled))
        );
    }

    public ngOnInit(): void {
        this.subscribeToSettings();
        this.subscriptions.push(
            // Observe the user list
            this.userRepository.getViewModelListObservable().subscribe(users => {
                this.users = users;
                this.filterNonAvailableUsers();
                this.cd.markForCheck();
            }),
            // observe changes to the viewport
            this.viewport.isMobileSubject.subscribe(isMobile => {
                this.isMobile = isMobile;
                this.cd.markForCheck();
            }),
            this.speakerRepo.getViewModelListObservable().subscribe(() => {
                this.updateSpeakers();
                this.cd.markForCheck();
            }),
            this.operator.userObservable.subscribe(user => (this._currentUser = user)),
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

    private isListOfSpeakersEmpty(): void {
        if (this.waitingSpeakers?.length || this.finishedSpeakers?.length) {
            this.isListOfSpeakersEmptyEvent.emit(false);
        } else {
            return this.isListOfSpeakersEmptyEvent.emit(!this.activeSpeaker);
        }
    }

    private updateCanReaddLastSpeaker(): void {
        let canReaddLast: boolean;
        if (this.finishedSpeakers?.length > 0) {
            const lastSpeaker = this.finishedSpeakers[this.finishedSpeakers.length - 1];
            let isLastSpeakerWaiting = false;
            if (lastSpeaker.point_of_order) {
                isLastSpeakerWaiting =
                    this.waitingSpeakers.some(
                        speaker => speaker.point_of_order && speaker.user_id === lastSpeaker.user_id
                    ) ||
                    (this.activeSpeaker?.point_of_order && this.activeSpeaker?.user_id === lastSpeaker.user_id);
            } else {
                isLastSpeakerWaiting =
                    this.waitingSpeakers.some(
                        speaker => !speaker.point_of_order && speaker.user_id === lastSpeaker.user_id
                    ) ||
                    (!this.activeSpeaker?.point_of_order && this.activeSpeaker?.user_id === lastSpeaker.user_id);
            }
            canReaddLast = !isLastSpeakerWaiting;
        } else {
            canReaddLast = false;
        }
        this.canReaddLastSpeakerEvent.emit(canReaddLast);
    }

    public addMyself(): void {
        this.addUserAsNewSpeaker({ userId: this._currentUser!.id });
    }

    /**
     * Click on the X button - removes the speaker from the list of speakers
     *
     * @param speaker optional speaker to remove. If none is given,
     * the operator themself is removed
     */
    public async removeSpeaker(speaker?: ViewSpeaker): Promise<void> {
        const title = speaker
            ? this.translate.instant(`Are you sure you want to remove this speaker from the list of speakers?`)
            : this.translate.instant(`Are you sure you want to remove yourself from this list of speakers?`);
        const speakerToDelete = speaker || this.findOperatorSpeaker();
        if (speakerToDelete && (await this.promptService.open(title))) {
            await this.speakerRepo.delete(speakerToDelete.id);
            this.filterNonAvailableUsers();
            this.interactionService.kickUsers([speakerToDelete.user], `Removed from the list of speakers`);
        }
    }

    public async updateSpeakerMeetingUser(speaker: ViewSpeaker): Promise<boolean> {
        const dialogRef = await this.speakerUserSelectDialog.open(this.listOfSpeakers);
        try {
            const result = await firstValueFrom(dialogRef.afterClosed());
            if (result) {
                await this.speakerRepo.setMeetingUser(speaker, result.meeting_user_id);
                return true;
            }
        } catch (e) {
            this.raiseError(e);
            throw e;
        }

        return false;
    }

    public async addInterposedQuestion(): Promise<void> {
        await this.speakerRepo.create(this.listOfSpeakers, this.canManage ? undefined : this._currentUser.id, {
            speechState: SpeechState.INTERPOSED_QUESTION
        });
    }

    public async addPointOfOrder(): Promise<void> {
        const dialogRef = await this.dialog.open(this.listOfSpeakers);
        try {
            const result = await firstValueFrom(dialogRef.afterClosed());
            if (result) {
                await this.speakerRepo.create(this.listOfSpeakers, this._currentUser!.id, {
                    pointOfOrder: true,
                    ...result
                });
            }
        } catch (e) {
            this.raiseError(e);
        }
    }

    public async removePointOfOrder(): Promise<void> {
        const speakerToDelete = this.findOperatorSpeaker(true);
        if (speakerToDelete) {
            const title = this.translate.instant(`Are you sure you want to irrevocably remove your point of order?`);
            if (!(this.restrictPointOfOrderActions && this.closed) || (await this.promptService.open(title))) {
                await this.speakerRepo.delete(speakerToDelete.id);
            }
        }
    }

    public isOpInWaitlist(pointOfOrder?: boolean): boolean {
        if (!this.waitingSpeakers) {
            return false;
        }
        return !!this.findOperatorSpeaker(pointOfOrder);
    }

    /**
     * Click on the mic button to mark a speaker as speaking
     *
     * @param speaker the speaker selected in one list of speakers
     */
    public async onStartButton(speaker: ViewSpeaker): Promise<void> {
        try {
            if (speaker.pause_time) {
                await this.speakerRepo.unpauseSpeak(speaker);
            } else {
                await this.speakerRepo.startToSpeak(speaker);
            }
            this.filterNonAvailableUsers();
        } catch (e) {
            this.raiseError(e);
        }
    }

    /**
     * Click on the mic-cross button to stop the current speaker
     */
    public async onPauseButton(speaker: ViewSpeaker): Promise<void> {
        try {
            await this.speakerRepo.pauseSpeak(speaker);
            this.filterNonAvailableUsers();
        } catch (e) {
            this.raiseError(e);
        }
    }

    /**
     * Click on the mic-cross button to stop the current speaker
     */
    public async onStopButton(speaker: ViewSpeaker): Promise<void> {
        try {
            if (speaker.speech_state === SpeechState.INTERPOSED_QUESTION && !speaker.meeting_user_id) {
                if (speaker.isSpeaking) {
                    await this.speakerRepo.pauseSpeak(speaker);
                }
                if (!(await this.updateSpeakerMeetingUser(speaker))) {
                    this.matSnackBar.open(
                        this.translate.instant(`You need to select a speaker to stop the speach.`),
                        this.translate.instant(`OK`)
                    );
                    return;
                }
            }
            await this.speakerRepo.stopToSpeak(speaker);
            this.filterNonAvailableUsers();
        } catch (e) {
            this.raiseError(e);
        }
    }

    public isSpeakerOperator(speaker: ViewSpeaker): boolean {
        return this.operator.operatorId === speaker.user_id;
    }

    public canMarkSpeaker(speaker: ViewSpeaker): boolean {
        return this.canManage || (this.canMarkSelf && this.isSpeakerOperator(speaker));
    }

    /**
     * Click on the star button. Toggles the marked attribute.
     *
     * @param speaker The speaker clicked on.
     */
    public async onMarkButton(speaker: ViewSpeaker): Promise<void> {
        await this.speakerRepo.setContribution(speaker);
    }

    public async onInterventionButton(speaker: ViewSpeaker): Promise<void> {
        await this.speakerRepo.setIntervention(speaker);
    }

    public async onProContraButtons(speaker: ViewSpeaker, isProSpeech: boolean): Promise<void> {
        if (isProSpeech) {
            await this.speakerRepo.setProSpeech(speaker);
        } else {
            await this.speakerRepo.setContraSpeech(speaker);
        }
    }

    /**
     * Receives an updated list from sorting-event.
     *
     * @param sortedSpeakerList The updated list.
     */
    public onSortingChanged(sortedSpeakerList: Selectable[]): void {
        if (!this.isMobile) {
            this.onSaveSorting(sortedSpeakerList);
        }
    }

    /**
     * send the current order of the sorting list to the server
     *
     * @param sortedSpeakerList The list to save.
     */
    public async onSaveSorting(sortedSpeakerList: Selectable[] = this.listElement.sortedItems): Promise<void> {
        return await this.speakerRepo
            .sortSpeakers(
                this._listOfSpeakers!,
                sortedSpeakerList.map(el => el.id)
            )
            .catch(this.raiseError);
    }

    public inviteToVoice(speaker: ViewSpeaker): void {
        this.interactionService.inviteToCall(speaker.userId);
    }

    private updateSpeakers(): void {
        if (!this.listOfSpeakers) {
            return;
        }

        const allSpeakers = this._listOfSpeakers!.speakers.sort((a, b) => a.weight - b.weight);
        this.waitingSpeakers = allSpeakers.filter(speaker => speaker.state === SpeakerState.WAITING);
        this.interposedQuestions = allSpeakers.filter(speaker => speaker.state === SpeakerState.INTERPOSED_QUESTION);
        this.finishedSpeakers = allSpeakers.filter(speaker => speaker.state === SpeakerState.FINISHED);

        // convert begin time to date and sort
        this.finishedSpeakers.sort((a: ViewSpeaker, b: ViewSpeaker) => {
            const aTime = new Date(a.begin_time).getTime();
            const bTime = new Date(b.begin_time).getTime();
            return aTime - bTime;
        });

        this.activeSpeaker = allSpeakers?.find(speaker => speaker.state === SpeakerState.CURRENT) || null;
        this.updateCanReaddLastSpeaker();
        this.isListOfSpeakersEmpty();

        this.filterNonAvailableUsers();
    }

    /**
     * Creates an array of users who currently shouldn't be selectable for the speaker list.
     */
    private filterNonAvailableUsers() {
        const nonAvailableUsers = this.users
            .filter(
                user =>
                    !(!this.onlyPresentUsers || user?.isPresentInMeeting()) ||
                    this.waitingSpeakers.some(speaker => speaker.user_id === user?.id)
            )
            .map(user => user?.id)
            .filter(user => !!user);
        this.nonAvailableUserIds = nonAvailableUsers;
    }

    /**
     * Adds a user as a new speaker to the current list of speakers.
     * If `userId` is undefined, it is set to the current user (operator).
     *
     * @param userId Optional. The id of a user, which is add as speaker.
     */
    public async addUserAsNewSpeaker(data: UserSelectionData): Promise<void> {
        if (!data.userId) {
            data.userId = this.operator.operatorId;
        }
        const user = this.userRepository.getViewModel(data.userId);
        let structureLevelId: Id;
        if (
            (await firstValueFrom(this.structureLevelCountdownEnabled)) &&
            user.getMeetingUser().structure_level_ids.length === 1
        ) {
            structureLevelId = user.getMeetingUser().structure_level_ids[0];
        }

        await this.speakerRepo.create(this.listOfSpeakers, data.userId!, {
            meeting_user_id: data.user?.meeting_user_id,
            structure_level_id: structureLevelId
        });
    }

    public async setStructureLevel(speaker: ViewSpeaker, structureLevel: Id): Promise<void> {
        if (structureLevel === speaker.structure_level_list_of_speakers?.structure_level_id) {
            structureLevel = null;
        }

        await this.speakerRepo.setStructureLevel(speaker, structureLevel);
    }

    /**
     * Checks how often a speaker has already finished speaking
     *
     * @param speaker
     * @returns 0 or the number of times a speaker occurs in finishedSpeakers
     */
    public hasSpokenCount(speaker: ViewSpeaker): number {
        return this.finishedSpeakers.filter(
            finishedSpeaker => finishedSpeaker.user_id === speaker.user_id && !finishedSpeaker.point_of_order
        ).length;
    }

    /**
     * Returns true if the speaker did never appear on any list of speakers
     *
     * @param speaker
     */
    public isFirstContribution(speaker: ViewSpeaker): boolean {
        return this.listOfSpeakersRepo.isFirstContribution(speaker);
    }

    /**
     * get the duration of a speech
     *
     * @param speaker
     * @returns string representation of the duration in `[MM]M:SS minutes` format
     */
    public durationString(speaker: ViewSpeaker): string {
        const duration = Math.floor(
            (speaker.getEndTimeAsDate()!.valueOf() - speaker.getBeginTimeAsDate()!.valueOf()) / 1000
        );
        return this.durationService.durationToString(duration, `m`);
    }

    public getSpeakerCountdown(speaker: ViewSpeaker): any {
        if (speaker.speech_state === SpeechState.INTERPOSED_QUESTION) {
            const total_pause = speaker.total_pause || 0;
            const end = speaker.pause_time || speaker.end_time || 0;
            return {
                running: speaker.isSpeaking,
                default_time: 0,
                countdown_time: speaker.isSpeaking
                    ? speaker.begin_time + total_pause
                    : (end - (speaker.begin_time + total_pause) || 0) * -1
            };
        } else if (
            this.meetingSettingService.instant(`list_of_speakers_intervention_time`) > 0 &&
            speaker.speech_state === SpeechState.INTERVENTION
        ) {
            const default_time = this.meetingSettingService.instant(`list_of_speakers_intervention_time`) || 0;
            const total_pause = speaker.total_pause || 0;
            const end = speaker.pause_time || speaker.end_time || 0;
            const countdown_time = speaker.isSpeaking
                ? speaker.begin_time + total_pause + default_time
                : (end - (speaker.begin_time + total_pause + default_time)) * -1;
            return {
                running: speaker.isSpeaking,
                default_time,
                countdown_time: speaker.begin_time ? countdown_time : default_time
            };
        } else if (this.structureLevelCountdownEnabled && speaker.structure_level_list_of_speakers) {
            const speakingTime = speaker.structure_level_list_of_speakers;
            const remaining = speakingTime.remaining_time + (speakingTime.additional_time || 0);
            return {
                running: !!speakingTime.current_start_time,
                countdown_time: speakingTime.current_start_time
                    ? speakingTime.current_start_time + remaining
                    : remaining
            };
        }

        return null;
    }

    /**
     * returns a locale-specific version of the starting time for the given speaker item
     *
     * @param speaker
     * @returns a time string using the current language setting of the client
     */
    public startTimeToString(speaker: ViewSpeaker): string {
        return speaker.getBeginTimeAsDate()!.toLocaleString(this.translate.currentLang);
    }

    private subscribeToSettings(): void {
        this.subscriptions.push(
            // observe changes the agenda_present_speakers_only setting
            this.meetingSettingService.get(`list_of_speakers_present_users_only`).subscribe(() => {
                this.filterNonAvailableUsers();
            }),
            // observe changes to the agenda_show_first_contribution setting
            // observe point of order settings
            this.meetingSettingService.get(`list_of_speakers_enable_point_of_order_speakers`).subscribe(show => {
                this.pointOfOrderEnabled = show;
            }),
            this.meetingSettingService.get(`list_of_speakers_enable_pro_contra_speech`).subscribe(enabled => {
                this.enableProContraSpeech = enabled;
            }),
            this.meetingSettingService.get(`list_of_speakers_can_set_contribution_self`).subscribe(canSet => {
                this.canMarkSelf = canSet;
            })
        );
    }

    private findOperatorSpeaker(pointOfOrder?: boolean): ViewSpeaker | undefined {
        return this.waitingSpeakers.find(
            speaker => speaker.user_id === this.operator.operatorId && speaker.point_of_order === pointOfOrder
        );
    }
}
