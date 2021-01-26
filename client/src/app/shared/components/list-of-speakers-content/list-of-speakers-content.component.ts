import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';

import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { ListOfSpeakersRepositoryService } from 'app/core/repositories/agenda/list-of-speakers-repository.service';
import { SpeakerRepositoryService } from 'app/core/repositories/agenda/speaker-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { DurationService } from 'app/core/ui-services/duration.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewportService } from 'app/core/ui-services/viewport.service';
import { SpeakerState } from 'app/shared/models/agenda/speaker';
import { ViewListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { ViewSpeaker } from 'app/site/agenda/models/view-speaker';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewUser } from 'app/site/users/models/view-user';
import { Selectable } from '../selectable';
import { SortingListComponent } from '../sorting-list/sorting-list.component';

@Component({
    selector: 'os-list-of-speakers-content',
    templateUrl: './list-of-speakers-content.component.html',
    styleUrls: ['./list-of-speakers-content.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListOfSpeakersContentComponent extends BaseModelContextComponent implements OnInit {
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

    public get isOpInList(): boolean {
        return this.waitingSpeakers.some(speaker => speaker.user_id === this.operator.operatorId);
    }

    public get canAddSelf(): boolean {
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
    private hasFinishesSpeakersEvent = new EventEmitter<boolean>();

    private currentUser: ViewUser = null;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private listOfSpeakersRepo: ListOfSpeakersRepositoryService,
        private activeMeetingService: ActiveMeetingService,
        private meetingSettingsService: MeetingSettingsService,
        private speakerRepo: SpeakerRepositoryService,
        private operator: OperatorService,
        private promptService: PromptService,
        private durationService: DurationService,
        private userRepository: UserRepositoryService,
        private viewport: ViewportService,
        private cd: ChangeDetectorRef
    ) {
        super(componentServiceCollector);
        this.addSpeakerForm = new FormGroup({ user_id: new FormControl() });
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.subscriptions.push(
            // Observe the user list
            this.userRepository.getViewModelListObservable().subscribe(users => {
                this.usersSubject.next(users);
                this.filterUsers();
                this.cd.markForCheck();
            }),
            // ovserve changes to the add-speaker form
            this.addSpeakerForm.valueChanges.subscribe(formResult => {
                // resetting a form triggers a form.next(null) - check if user_id
                if (formResult && formResult.user_id) {
                    this.addNewSpeaker(formResult.user_id);
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
            this.operator.userObservable.subscribe(user => (this.currentUser = user)),
            // observe changes the agenda_present_speakers_only setting
            this.meetingSettingsService.get('list_of_speakers_present_users_only').subscribe(() => {
                this.filterUsers();
            }),
            // observe changes to the agenda_show_first_contribution setting
            this.meetingSettingsService.get('list_of_speakers_show_first_contribution').subscribe(show => {
                this.showFistContributionHint = show;
            })
        );
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
        this.speakerRepo.create(this._listOfSpeakers, userId).then(() => this.addSpeakerForm.reset(), this.raiseError);
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
    public async removeSpeaker(speaker: ViewSpeaker): Promise<void> {
        const title = this.translate.instant(
            'Are you sure you want to delete this speaker from this list of speakers?'
        );
        if (await this.promptService.open(title)) {
            try {
                await this.speakerRepo.delete(speaker);
                this.filterUsers();
            } catch (e) {
                this.raiseError(e);
            }
        }
    }

    public removeMyself(): void {
        this.removeSpeaker(this._listOfSpeakers.getSpeakerByUserId(this.currentUser.id));
    }

    /**
     * Click on the mic button to mark a speaker as speaking
     *
     * @param speaker the speaker marked in the list
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

    /**
     * Click on the star button. Toggles the marked attribute.
     *
     * @param speaker The speaker clicked on.
     */
    public async onMarkButton(speaker: ViewSpeaker): Promise<void> {
        await this.speakerRepo.changeMarkingOfSpeaker(speaker, !speaker.marked).catch(this.raiseError);
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
    public onSaveSorting(sortedSpeakerList: Selectable[] = this.listElement.sortedItems): void {
        this.speakerRepo
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

        this.activeSpeaker = allSpeakers.find(speaker => speaker.state === SpeakerState.CURRENT);

        this.hasFinishesSpeakersEvent.emit(this.finishedSpeakers?.length > 0);
        const hasSpeakers = !!this.waitingSpeakers.length || !!this.finishedSpeakers.length || !!this.activeSpeaker;
        this.isListOfSpeakersEmptyEvent.emit(!hasSpeakers);
        this.cd.markForCheck();
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
        this.addNewSpeaker(newUser.id);
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
}
