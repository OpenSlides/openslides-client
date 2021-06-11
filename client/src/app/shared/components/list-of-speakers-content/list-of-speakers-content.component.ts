import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { BehaviorSubject } from 'rxjs';

import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Id } from 'app/core/definitions/key-types';
import { ListOfSpeakersRepositoryService } from 'app/core/repositories/agenda/list-of-speakers-repository.service';
import { SpeakerRepositoryService } from 'app/core/repositories/agenda/speaker-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { DurationService } from 'app/core/ui-services/duration.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewportService } from 'app/core/ui-services/viewport.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { SpeakerState, SpeechState } from 'app/shared/models/agenda/speaker';
import { infoDialogSettings } from 'app/shared/utils/dialog-settings';
import { ViewListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { ViewSpeaker } from 'app/site/agenda/models/view-speaker';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewUser } from 'app/site/users/models/view-user';
import { PointOfOrderDialogComponent } from '../point-of-order-dialog/point-of-order-dialog.component';
import { Selectable } from '../selectable';
import { SortingListComponent } from '../sorting-list/sorting-list.component';

@Component({
    selector: 'os-list-of-speakers-content',
    templateUrl: './list-of-speakers-content.component.html',
    styleUrls: ['./list-of-speakers-content.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ListOfSpeakersContentComponent extends BaseModelContextComponent implements OnInit {
    public readonly SpeechState = SpeechState;

    @ViewChild(SortingListComponent)
    public listElement: SortingListComponent;

    private _listOfSpeakers: ViewListOfSpeakers;
    public finishedSpeakers: ViewSpeaker[] = [];
    public waitingSpeakers: ViewSpeaker[] = [];
    public activeSpeaker: ViewSpeaker;

    /**
     * Required for the user search selector
     */
    public addSpeakerForm: FormGroup;

    public usersSubject = new BehaviorSubject<ViewUser[]>([]);
    public filteredUsersSubject = new BehaviorSubject<ViewUser[]>([]);

    public isSortMode: boolean;

    public isMobile: boolean;

    public showFistContributionHint: boolean;

    public get showPointOfOrders(): boolean {
        return this.pointOfOrderEnabled && this.canAddDueToPresence;
    }

    public enableProContraSpeech: boolean;
    private pointOfOrderEnabled: boolean;
    private canSetMarkSelf: boolean;
    private noteForAll: boolean;

    public get title(): string {
        return this._listOfSpeakers?.getTitle();
    }

    public get filteredUsers(): ViewUser[] {
        return this.filteredUsersSubject.value;
    }

    public get closed(): boolean {
        return this._listOfSpeakers?.closed;
    }

    public get opCanManage(): boolean {
        return this.operator.hasPerms(this.permission.listOfSpeakersCanManage);
    }

    public get canAddDueToPresence(): boolean {
        return !this.onlyPresentUsers || this.currentUser.isPresentInMeeting();
    }

    private get onlyPresentUsers(): boolean {
        return this.meetingSettingService.instant('list_of_speakers_present_users_only');
    }

    @Input()
    public set listOfSpeakers(los: ViewListOfSpeakers) {
        if (los) {
            this._listOfSpeakers = los;
            this.updateSpeakers();
        }
    }

    public get listOfSpeakers(): ViewListOfSpeakers {
        return this._listOfSpeakers;
    }

    @Input()
    public customTitle: boolean;

    @Input()
    public set sortMode(isActive: boolean) {
        if (this.isSortMode) {
            this.listElement.restore();
        }
        this.isSortMode = isActive;
    }

    @Output()
    private isListOfSpeakersEmptyEvent = new EventEmitter<boolean>();

    @Output()
    private canReaddLastSpeakerEvent = new EventEmitter<boolean>();

    private currentUser: ViewUser = null;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private listOfSpeakersRepo: ListOfSpeakersRepositoryService,
        private activeMeetingService: ActiveMeetingService,
        private speakerRepo: SpeakerRepositoryService,
        private operator: OperatorService,
        private promptService: PromptService,
        private durationService: DurationService,
        private userRepository: UserRepositoryService,
        private viewport: ViewportService,
        private cd: ChangeDetectorRef,
        private dialog: MatDialog
    ) {
        super(componentServiceCollector);
        this.addSpeakerForm = new FormGroup({ user_id: new FormControl() });
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.subscribeToSettings();
        this.subscriptions.push(
            // Observe the user list
            this.userRepository.getViewModelListObservable().subscribe(users => {
                this.usersSubject.next(users);
                this.filterUsers();
                this.cd.markForCheck();
            }),
            // ovserve changes to the add-speaker form
            this.addSpeakerForm.valueChanges.subscribe(async formResult => {
                // resetting a form triggers a form.next(null) - check if user_id
                if (formResult && formResult.user_id) {
                    await this.addUserAsNewSpeaker(formResult.user_id);
                    this.addSpeakerForm.reset();
                }
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
            this.operator.userObservable.subscribe(user => (this.currentUser = user))
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

    public getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingService.meetingId],
            follow: [{ idField: 'user_ids', fieldset: 'shortName' }],
            fieldset: []
        };
    }

    /**
     * Create a speaker out of an id
     *
     * @param userId the user id to add to the list. No parameter adds the operators user as speaker.
     */
    public addNewSpeaker(userId: number): void {
        this.speakerRepo.create(this._listOfSpeakers, userId).then(() => this.addSpeakerForm.reset());
    }

    public addMyself(): void {
        this.addNewSpeaker(this.currentUser.id);
    }

    /**
     * Click on the X button - removes the speaker from the list of speakers
     *
     * @param speaker optional speaker to remove. If none is given,
     * the operator themself is removed
     */
    public async removeSpeaker(speaker?: ViewSpeaker): Promise<void> {
        const title = speaker
            ? this.translate.instant('Are you sure you want to remove this speaker from the list of speakers?')
            : this.translate.instant('Are you sure you want to remove yourself from this list of speakers?');
        const speakerToDelete = speaker || this.findOperatorSpeaker();
        if (await this.promptService.open(title)) {
            await this.speakerRepo.delete(speakerToDelete.id);
            this.filterUsers();
        }
    }

    public async addPointOfOrder(): Promise<void> {
        const dialogRef = this.dialog.open(PointOfOrderDialogComponent, {
            data: this.listOfSpeakers,
            ...infoDialogSettings,
            disableClose: false
        });
        try {
            const result = await dialogRef.afterClosed().toPromise();
            if (result) {
                await this.speakerRepo.create(this.listOfSpeakers, this.currentUser.id, {
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
        await this.speakerRepo.delete(speakerToDelete.id);
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
            this.filterUsers();
        } catch (e) {
            this.raiseError(e);
        }
    }

    /**
     * Click on the mic-cross button to stop the current speaker
     */
    public async onStopButton(): Promise<void> {
        try {
            await this.speakerRepo.stopToSpeak(this.activeSpeaker);
            this.filterUsers();
        } catch (e) {
            this.raiseError(e);
        }
    }

    public isSpeakerOperator(speaker: ViewSpeaker): boolean {
        return this.operator.operatorId === speaker.user_id;
    }

    public canSpeakerMark(speaker: ViewSpeaker): boolean {
        return this.opCanManage || (this.canSetMarkSelf && this.isSpeakerOperator(speaker));
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
                this._listOfSpeakers,
                sortedSpeakerList.map(el => el.id)
            )
            .catch(this.raiseError);
    }

    private updateSpeakers(): void {
        if (!this.listOfSpeakers) {
            return;
        }

        const allSpeakers = this.listOfSpeakers.speakers.sort((a, b) => a.weight - b.weight);
        this.waitingSpeakers = allSpeakers.filter(speaker => speaker.state === SpeakerState.WAITING);
        this.finishedSpeakers = allSpeakers.filter(speaker => speaker.state === SpeakerState.FINISHED);

        // convert begin time to date and sort
        this.finishedSpeakers.sort((a: ViewSpeaker, b: ViewSpeaker) => {
            const aTime = new Date(a.begin_time).getTime();
            const bTime = new Date(b.begin_time).getTime();
            return aTime - bTime;
        });

        this.activeSpeaker = allSpeakers?.find(speaker => speaker.state === SpeakerState.CURRENT);
        this.updateCanReaddLastSpeaker();
        this.isListOfSpeakersEmpty();
    }

    /**
     * Triggers an update of the filter for the list of available potential speakers
     * (triggered on an update of users or config)
     */
    private filterUsers(): void {
        const availableUsers = this.usersSubject.getValue().filter(user => {
            return (
                (!this.onlyPresentUsers || user.isPresentInMeeting()) &&
                !this.waitingSpeakers.some(speaker => speaker.user_id === user.id)
            );
        });
        this.filteredUsersSubject.next(availableUsers);
    }

    /**
     * Imports a new user by the given username.
     *
     * @param username The name of the new user.
     */
    public async onCreateUser(username: string): Promise<void> {
        const newUser = await this.userRepository.createFromString(username);
        this.addUserAsNewSpeaker(newUser.id);
    }

    /**
     * Adds a user as a new speaker to the current list of speakers.
     * If `userId` is undefined, it is set to the current user (operator).
     *
     * @param userId Optional. The id of a user, which is add as speaker.
     */
    public async addUserAsNewSpeaker(userId?: Id): Promise<void> {
        if (!userId) {
            userId = this.operator.operatorId;
        }
        await this.speakerRepo.create(this.listOfSpeakers, userId);
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
            (speaker.getEndTimeAsDate().valueOf() - speaker.getBeginTimeAsDate().valueOf()) / 1000
        );
        return this.durationService.durationToString(duration, 'm');
    }

    /**
     * returns a locale-specific version of the starting time for the given speaker item
     *
     * @param speaker
     * @returns a time string using the current language setting of the client
     */
    public startTimeToString(speaker: ViewSpeaker): string {
        return speaker.getBeginTimeAsDate().toLocaleString(this.translate.currentLang);
    }

    private subscribeToSettings(): void {
        this.subscriptions.push(
            // observe changes the agenda_present_speakers_only setting
            this.meetingSettingService.get('list_of_speakers_present_users_only').subscribe(() => {
                this.filterUsers();
            }),
            // observe changes to the agenda_show_first_contribution setting
            this.meetingSettingService.get('list_of_speakers_show_first_contribution').subscribe(show => {
                this.showFistContributionHint = show;
            }),
            // observe point of order settings
            this.meetingSettingService.get('list_of_speakers_enable_point_of_order_speakers').subscribe(show => {
                this.pointOfOrderEnabled = show;
            }),
            this.meetingSettingService.get('list_of_speakers_enable_pro_contra_speech').subscribe(enabled => {
                this.enableProContraSpeech = enabled;
            }),
            this.meetingSettingService.get('list_of_speakers_can_set_contribution_self').subscribe(canSet => {
                this.canSetMarkSelf = canSet;
            }),
            this.meetingSettingService.get('list_of_speakers_speaker_note_for_everyone').subscribe(enabled => {
                this.noteForAll = enabled;
            })
        );
    }

    private findOperatorSpeaker(pointOfOrder?: boolean): ViewSpeaker {
        return this.waitingSpeakers.find(
            speaker => speaker.user_id === this.operator.operatorId && speaker.point_of_order === pointOfOrder
        );
    }
}
