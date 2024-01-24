import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { collectionFromFqid } from 'src/app/infrastructure/utils/transform-functions';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ListOfSpeakersContentComponent } from 'src/app/site/pages/meetings/modules/list-of-speakers-content/components/list-of-speakers-content/list-of-speakers-content.component';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { ProjectionBuildDescriptor } from 'src/app/site/pages/meetings/view-models/projection-build-descriptor';
import { CollectionMapperService } from 'src/app/site/services/collection-mapper.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { CurrentListOfSpeakersService } from '../../services/current-list-of-speakers.service';
import { CurrentListOfSpeakersSlideService } from '../../services/current-list-of-speakers-slide.service';
import { ListOfSpeakersControllerService } from '../../services/list-of-speakers-controller.service';
import { ViewListOfSpeakers } from '../../view-models';

@Component({
    selector: `os-list-of-speakers`,
    templateUrl: `./list-of-speakers.component.html`,
    styleUrls: [`./list-of-speakers.component.scss`]
})
export class ListOfSpeakersComponent extends BaseMeetingComponent implements OnInit, OnDestroy {
    /**
         * The projector to show.
         */
    public projector!: ViewProjector;

    public readonly COLLECTION = ViewListOfSpeakers.COLLECTION;

    @ViewChild(`content`)
    private readonly _listOfSpeakersContentComponent!: ListOfSpeakersContentComponent;

    /**
     * Determine if the user is viewing the current list if speakers
     */
    public isCurrentListOfSpeakers = false;

    /**
     * Holds the view item to the given topic
     */
    public viewListOfSpeakers: ViewListOfSpeakers | undefined;

    /**
     * Holds a list of projectors. Only in CurrentListOfSpeakers mode
     */
    public projectors: ViewProjector[] = [];

    /**
     * @returns true if the list of speakers list is currently closed
     */
    public get isListOfSpeakersClosed(): boolean {
        return this.viewListOfSpeakers && this.viewListOfSpeakers.closed;
    }

    public isMobile = false;

    public manualSortMode = false;

    /**
     * filled by child component
     */
    public isListOfSpeakersEmpty = false;

    public get isNextListOfSpeakersEmpty(): boolean {
        return !this.viewListOfSpeakers?.waitingSpeakers?.length;
    }

    public get isPreviousListOfSpeakersEmpty(): boolean {
        return !this.viewListOfSpeakers?.finishedSpeakers?.length;
    }

    public structureLevelCountdownEnabled = false;
    /**
     * filled by child component
     */
    public canReaddLastSpeaker = false;

    private _losSubscription: Subscription | null = null;
    private _losId!: Id;

    /**
     * Constructor for speaker list component. Generates the forms.
     */
    public constructor(
        protected override translate: TranslateService,
        private listOfSpeakersRepo: ListOfSpeakersControllerService,
        private promptService: PromptService,
        private currentListOfSpeakersService: CurrentListOfSpeakersService,
        private currentListOfSpeakersSlideService: CurrentListOfSpeakersSlideService,
        private viewport: ViewPortService,
        private collectionMapper: CollectionMapperService
    ) {
        super();

        this.subscriptions.push(
            this.meetingSettingsService
                .get(`list_of_speakers_default_structure_level_time`)
                .subscribe(time => (this.structureLevelCountdownEnabled = time > 0))
        );
    }

    public ngOnInit(): void {
        this.subscriptions.push(this.viewport.isMobileSubject.subscribe(isMobile => (this.isMobile = isMobile)));
    }

    public onIdFound(id: Id | null): void {
        if (id) {
            this._losId = id;
            this.loadListOfSpeakers();
        } else {
            this.loadCurrentListOfSpeakers();
        }
    }

    /**
     * @returns the CLOS slide build descriptor
     */
    public getClosSlide(): ProjectionBuildDescriptor {
        return this.currentListOfSpeakersSlideService.getProjectionBuildDescriptor(false) as ProjectionBuildDescriptor;
    }

    /**
     * @returns the verbose name of the model of the content object from viewItem.
     * E.g. if a motion is the current content object, "Motion" will be the returned value.
     */
    public getContentObjectProjectorButtonText(): string {
        if (this.viewListOfSpeakers?.content_object_id) {
            const collection = collectionFromFqid(this.viewListOfSpeakers.content_object_id);
            const verboseName = this.collectionMapper.getRepository(collection)!.getVerboseName();
            return verboseName;
        }
        return ``;
    }

    public setManualSortMode(active: boolean): void {
        this.manualSortMode = active;
    }

    /**
     * Saves sorting on mobile devices.
     */
    public async onMobileSaveSorting(): Promise<void> {
        await this._listOfSpeakersContentComponent.onSaveSorting();
        this.manualSortMode = false;
    }

    /**
     * Removes the last finished speaker from the list an re-adds him on pole position
     */
    public readdLastSpeaker(): void {
        this.listOfSpeakersRepo.readdLastSpeaker(this.viewListOfSpeakers);
    }

    public async setLosClosed(closed: boolean): Promise<void> {
        await this.listOfSpeakersRepo.setClosed(closed, this.viewListOfSpeakers);
    }

    /**
     * Clears the speaker list by removing all current, past and future speakers
     * after a confirmation dialog
     */
    public async clearSpeakerList(): Promise<void> {
        const title = this.translate.instant(
            `Are you sure you want to delete all speakers from this list of speakers?`
        );
        if (await this.promptService.open(title)) {
            this.listOfSpeakersRepo.deleteAllSpeakers(this.viewListOfSpeakers);
        }
    }

    public async clearPreviousSpeakerList(): Promise<void> {
        const title = this.translate.instant(
            `Are you sure you want to delete all previous speakers from this list of speakers?`
        );
        if (await this.promptService.open(title)) {
            this.listOfSpeakersRepo.deleteAllPreviousSpeakers(this.viewListOfSpeakers);
        }
    }

    public async clearNextSpeakerList(): Promise<void> {
        const title = this.translate.instant(
            `Are you sure you want to delete all next speakers from this list of speakers?`
        );
        if (await this.promptService.open(title)) {
            this.listOfSpeakersRepo.deleteAllNextSpeakers(this.viewListOfSpeakers);
        }
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        if (this._losSubscription) {
            this._losSubscription.unsubscribe();
        }
    }

    private loadListOfSpeakers(): void {
        this.setupLosSubscription();
    }

    private loadCurrentListOfSpeakers(): void {
        this.subscriptions.push(
            this.currentListOfSpeakersService.currentListOfSpeakersObservable.subscribe(clos => {
                if (clos) {
                    this.setListOfSpeakers(clos);
                }
            })
        );
    }

    private setListOfSpeakers(listOfSpeakers: ViewListOfSpeakers): void {
        const title = this.isCurrentListOfSpeakers
            ? `Current list of speakers`
            : listOfSpeakers.getTitle() + ` - ${this.translate.instant(`List of speakers`)}`;
        super.setTitle(title);
        this.viewListOfSpeakers = listOfSpeakers;
    }

    private setupLosSubscription(): void {
        if (this._losSubscription) {
            this._losSubscription.unsubscribe();
        }
        this._losSubscription = this.listOfSpeakersRepo
            .getViewModelObservable(this._losId)
            .subscribe(listOfSpeakers => {
                if (listOfSpeakers) {
                    this.setListOfSpeakers(listOfSpeakers);
                }
            });
    }
}
