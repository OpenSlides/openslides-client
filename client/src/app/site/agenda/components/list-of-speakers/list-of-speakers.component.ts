import { SummaryResolver } from '@angular/compiler';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { ModelSubscription } from 'app/core/core-services/autoupdate.service';
import { CollectionMapperService } from 'app/core/core-services/collection-mapper.service';
import { collectionFromFqid } from 'app/core/core-services/key-transforms';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { Id } from 'app/core/definitions/key-types';
import { ListOfSpeakersRepositoryService } from 'app/core/repositories/agenda/list-of-speakers-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { DurationService } from 'app/core/ui-services/duration.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewportService } from 'app/core/ui-services/viewport.service';
import { ListOfSpeakersContentComponent } from 'app/shared/components/list-of-speakers-content/list-of-speakers-content.component';
import { Selectable } from 'app/shared/components/selectable';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ProjectorElementBuildDeskriptor } from 'app/site/base/projectable';
import { ViewProjector } from 'app/site/projector/models/view-projector';
import { CurrentListOfSpeakersSlideService } from 'app/site/projector/services/current-list-of-speakers-slide.service';
import { CurrentListOfSpeakersService } from 'app/site/projector/services/current-list-of-speakers.service';
import { ViewListOfSpeakers } from '../../models/view-list-of-speakers';
import { ViewSpeaker } from '../../models/view-speaker';

/**
 * The list of speakers for agenda items.
 */
@Component({
    selector: 'os-list-of-speakers',
    templateUrl: './list-of-speakers.component.html',
    styleUrls: ['./list-of-speakers.component.scss']
})
export class ListOfSpeakersComponent extends BaseModelContextComponent implements OnInit, OnDestroy {
    @ViewChild('content')
    private listOfSpeakersContentComponent: ListOfSpeakersContentComponent;

    /**
     * Determine if the user is viewing the current list if speakers
     */
    public isCurrentListOfSpeakers = false;

    /**
     * Holds the view item to the given topic
     */
    public viewListOfSpeakers: ViewListOfSpeakers;

    /**
     * Holds a list of projectors. Only in CurrentListOfSpeakers mode
     */
    public projectors: ViewProjector[];

    /**
     * @returns true if the list of speakers list is currently closed
     */
    public get isListOfSpeakersClosed(): boolean {
        return this.viewListOfSpeakers && this.viewListOfSpeakers.closed;
    }

    public isMobile: boolean;

    public manualSortMode = false;

    /**
     * filled by child component
     */
    public isListOfSpeakersEmpty: boolean;

    /**
     * filled by child component
     */
    public hasFinishedSpeakers: boolean;

    private losSubscription: Subscription;

    /**
     * Constructor for speaker list component. Generates the forms.
     *
     * @param title
     * @param translate
     * @param snackBar
     * @param route Angulars ActivatedRoute
     * @param DS the DataStore
     * @param listOfSpeakersRepo Repository for list of speakers
     * @param operator the current operator
     * @param promptService
     * @param currentListOfSpeakersService
     * @param durationService helper for speech duration display
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private route: ActivatedRoute,
        private listOfSpeakersRepo: ListOfSpeakersRepositoryService,
        private promptService: PromptService,
        private currentListOfSpeakersService: CurrentListOfSpeakersService,
        private currentListOfSpeakersSlideService: CurrentListOfSpeakersSlideService,
        private meetingSettingsService: MeetingSettingsService,
        private viewport: ViewportService,
        private collectionMapper: CollectionMapperService,
        private operator: OperatorService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        const id = parseInt(this.route.snapshot.url[this.route.snapshot.url.length - 1].path, 10);
        this.setListOfSpeakersById(id);
        // Check, if we are on the current list of speakers.
        // this.isCurrentListOfSpeakers =
        //     this.route.snapshot.url.length > 0
        //         ? this.route.snapshot.url[this.route.snapshot.url.length - 1].path === 'speakers'
        //         : true;

        // if (this.isCurrentListOfSpeakers) {
        //     this.subscriptions.push(
        //         this.currentListOfSpeakersService.currentListOfSpeakersObservable.subscribe(clos => {
        //             this.setListOfSpeakers(clos);
        //         })
        //     );
        // } else {
        //     const id = +this.route.snapshot.url[this.route.snapshot.url.length - 1].path;
        //     this.setListOfSpeakersById(id);
        // }
    }

    public opCanManage(): boolean {
        return this.operator.hasPerms(Permission.agendaCanManageListOfSpeakers);
    }

    /**
     * Shows the current list of speakers (CLOS) of a given projector.
     */
    private updateClosProjector(): void {
        if (!this.projectors.length) {
            return;
        }
        throw new Error('TODO'); // Get the reference projector from the active meeting
        /*const referenceProjector = this.projectors[0].referenceProjector;
        if (!referenceProjector || referenceProjector.id === this.closReferenceProjectorId) {
            return;
        }
        this.closReferenceProjectorId = referenceProjector.id;

        if (this.projectorSubscription) {
            this.projectorSubscription.unsubscribe();
            this.viewListOfSpeakers = null;
        }

        this.projectorSubscription = this.currentListOfSpeakersService
            .getListOfSpeakersObservable(referenceProjector)
            .subscribe(listOfSpeakers => {
                if (listOfSpeakers) {
                    this.setListOfSpeakers(listOfSpeakers);
                }
            });
        this.subscriptions.push(this.projectorSubscription);*/
    }

    /**
     * @returns the CLOS slide build descriptor
     */
    public getClosSlide(): ProjectorElementBuildDeskriptor {
        return this.currentListOfSpeakersSlideService.getSlide(false);
    }

    /**
     * Sets the current list of speakers id to show
     *
     * @param id the list of speakers id
     */
    private setListOfSpeakersById(id: number): void {
        if (this.losSubscription) {
            this.losSubscription.unsubscribe();
        }
        this.losSubscription = this.listOfSpeakersRepo.getViewModelObservable(id).subscribe(listOfSpeakers => {
            if (listOfSpeakers) {
                this.setListOfSpeakers(listOfSpeakers);
            }
        });

        this.requestModels({
            viewModelCtor: ViewListOfSpeakers,
            ids: [id],
            follow: [
                {
                    idField: 'speaker_ids',
                    follow: [{ idField: 'user_id', fieldset: 'shortName' }]
                },
                'content_object_id' // To retreive the title
            ]
        });
    }

    private setListOfSpeakers(listOfSpeakers: ViewListOfSpeakers): void {
        const title = this.isCurrentListOfSpeakers
            ? 'Current list of speakers'
            : listOfSpeakers.getTitle() + ` - ${this.translate.instant('List of speakers')}`;
        super.setTitle(title);
        this.viewListOfSpeakers = listOfSpeakers;
    }

    /**
     * @returns the verbose name of the model of the content object from viewItem.
     * E.g. if a motion is the current content object, "Motion" will be the returned value.
     */
    public getContentObjectProjectorButtonText(): string {
        if (this.viewListOfSpeakers.content_object_id) {
            const collection = collectionFromFqid(this.viewListOfSpeakers.content_object_id);
            const verboseName = this.collectionMapper.getRepository(collection).getVerboseName();
            return verboseName;
        }
    }

    public setManualSortMode(active: boolean): void {
        this.manualSortMode = active;
    }

    /**
     * Saves sorting on mobile devices.
     */
    public async onMobileSaveSorting(): Promise<void> {
        await this.listOfSpeakersContentComponent.onSaveSorting();
        this.manualSortMode = false;
    }

    /**
     * Removes the last finished speaker from the list an re-adds him on pole position
     */
    public readdLastSpeaker(): void {
        this.listOfSpeakersRepo.readdLastSpeaker(this.viewListOfSpeakers).catch(this.raiseError);
    }

    /**
     * Closes the current list of speakers
     */
    public closeSpeakerList(): Promise<void> {
        if (!this.viewListOfSpeakers.closed) {
            return this.listOfSpeakersRepo.closeListOfSpeakers(this.viewListOfSpeakers);
        }
    }

    /**
     * Opens the list of speaker for the current item
     */
    public openSpeakerList(): Promise<void> {
        if (this.viewListOfSpeakers.closed) {
            return this.listOfSpeakersRepo.reopenListOfSpeakers(this.viewListOfSpeakers);
        }
    }

    /**
     * Clears the speaker list by removing all current, past and future speakers
     * after a confirmation dialog
     */
    public async clearSpeakerList(): Promise<void> {
        const title = this.translate.instant(
            'Are you sure you want to delete all speakers from this list of speakers?'
        );
        if (await this.promptService.open(title)) {
            this.listOfSpeakersRepo.deleteAllSpeakers(this.viewListOfSpeakers);
        }
    }

    /**
     * returns a locale-specific version of the starting time for the given speaker item
     *
     * @param speaker
     * @returns a time string using the current language setting of the client
     */
    public startTimeToString(speaker: ViewSpeaker): string {
        return new Date(speaker.begin_time).toLocaleString(this.translate.currentLang);
    }

    /**
     * get the duration of a speech
     *
     * @param speaker
     * @returns string representation of the duration in `[MM]M:SS minutes` format
     */
    public durationString(speaker: ViewSpeaker): string {
        throw new Error('TODO!');
        /*
        const duration = Math.floor(
            (new Date(speaker.end_time).valueOf() - new Date(speaker.begin_time).valueOf()) / 1000
        );
        return `${this.durationService.durationToString(duration, 'm')}`;
        */
    }

    /**
     * Imports a new user by the given username.
     *
     * @param username The name of the new user.
     */
    public async onCreateUser(username: string): Promise<void> {
        throw new Error('TODO!');
        /*const newUser = await this.userRepository.createFromString(username);
        this.addNewSpeaker(newUser.id);
        */
    }

    /**
     * Triggers an update of the filter for the list of available potential speakers
     * (triggered on an update of users or config)
     */
    private filterUsers(): void {
        throw new Error('TODO!');
        /*const presentUsersOnly = this.meetingSettingsService.instant('list_of_speakers_present_users_only');
        const users = presentUsersOnly
            ? this.users.getValue().filter(u => u.isPresentInMeeting())
            : this.users.getValue();
        if (!this.speakers || !this.speakers.length) {
            this.filteredUsers.next(users);
        } else {
            this.filteredUsers.next(users.filter(u => !this.speakers.some(speaker => speaker.user_id === u.id)));
        }*/
    }

    /**
     * send the current order of the sorting list to the server
     *
     * @param sortedSpeakerList The list to save.
     */
    private onSaveSorting(sortedSpeakerList: Selectable[]): void {
        throw new Error('TODO!');
        /*if (this.isSortMode) {
            this.listOfSpeakersRepo
                .sortSpeakers(
                    this.viewListOfSpeakers,
                    sortedSpeakerList.map(el => el.id)
                )
                .catch(this.raiseError);
        }*/
    }

    /**
     * Check, that the sorting mode is immediately active, if not in mobile-view.
     *
     * @param isMobile If currently a mobile device is used.
     */
    private checkSortMode(isMobile: boolean): void {
        this.isMobile = isMobile;
        throw new Error('TODO!');
        // this.isSortMode = !isMobile;
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        if (this.losSubscription) {
            this.losSubscription.unsubscribe();
        }
    }
}
