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

    public finishedSpeakers: ViewSpeaker[] = [];
    public waitingSpeakers: ViewSpeaker[] = [];
    public activeSpeaker: ViewSpeaker | null = null;

    public users: ViewUser[] = [];
    public nonAvailableUserIds: number[] = [];

    public isSortMode: boolean = false;

    public isMobile: boolean = false;

    public get showFirstContributionHintObservable(): Observable<boolean> {
        return this.meetingSettingsService.get(`list_of_speakers_show_first_contribution`);
    }

    public get showPointOfOrders(): boolean {
        return this.pointOfOrderEnabled && this.canAddDueToPresence;
    }

    public get showSpeakerNoteForEveryoneObservable(): Observable<boolean> {
        return this.meetingSettingsService.get(`list_of_speakers_speaker_note_for_everyone`);
    }

    public enableProContraSpeech: boolean = false;

    public get title(): string {
        return this._listOfSpeakers?.getTitle() || ``;
    }

    public get closed(): boolean {
        return this._listOfSpeakers?.closed || false;
    }

    public get canManage(): boolean {
        return this.operator.hasPerms(this.permission.listOfSpeakersCanManage);
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

    @Output()
    private isListOfSpeakersEmptyEvent = new EventEmitter<boolean>();

    @Output()
    private canReaddLastSpeakerEvent = new EventEmitter<boolean>();

    private _currentUser: ViewUser | null = null;

    private _listOfSpeakers: ViewListOfSpeakers | null = null;

    private pointOfOrderEnabled: boolean = false;
    private canMarkSelf: boolean = false;

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
        private interactionService: InteractionService
    ) {
        super(componentServiceCollector, translate);
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
            const isLastSpeakerWaiting = this.waitingSpeakers.some(speaker => speaker.user_id === lastSpeaker.user_id);
            canReaddLast = !lastSpeaker.point_of_order && !isLastSpeakerWaiting;
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
            this.interactionService.kickUsers([speaker.user], `Removed from the list of speakers`);
        }
    }

    public async addPointOfOrder(): Promise<void> {
        const dialogRef = await this.dialog.open(this.listOfSpeakers);
        try {
            const result = await firstValueFrom(dialogRef.afterClosed());
            if (result) {
                await this.speakerRepo.create(this.listOfSpeakers, this._currentUser!.id, {
                    pointOfOrder: true,
                    note: result.note
                });
            }
        } catch (e) {
            this.raiseError(e);
        }
    }

    public async removePointOfOrder(): Promise<void> {
        const speakerToDelete = this.findOperatorSpeaker(true);
        if (speakerToDelete) {
            await this.speakerRepo.delete(speakerToDelete.id);
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
            await this.speakerRepo.startToSpeak(speaker);
            this.filterNonAvailableUsers();
        } catch (e) {
            this.raiseError(e);
        }
    }

    /**
     * Click on the mic-cross button to stop the current speaker
     */
    public async onStopButton(): Promise<void> {
        try {
            await this.speakerRepo.stopToSpeak(this.activeSpeaker!);
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
                    !(!this.onlyPresentUsers || user.isPresentInMeeting()) ||
                    this.waitingSpeakers.some(speaker => speaker.user_id === user.id)
            )
            .map(user => user.id);
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
        await this.speakerRepo.create(this.listOfSpeakers, data.userId!);
    }

    /**
     * Checks how often a speaker has already finished speaking
     *
     * @param speaker
     * @returns 0 or the number of times a speaker occurs in finishedSpeakers
     */
    public hasSpokenCount(speaker: ViewSpeaker): number {
        return this.finishedSpeakers.filter(finishedSpeaker => finishedSpeaker.user_id === speaker.user_id).length;
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
