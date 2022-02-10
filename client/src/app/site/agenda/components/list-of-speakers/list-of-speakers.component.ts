import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CollectionMapperService } from 'app/core/core-services/collection-mapper.service';
import { collectionFromFqid } from 'app/core/core-services/key-transforms';
import { ListOfSpeakersRepositoryService } from 'app/core/repositories/agenda/list-of-speakers-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewportService } from 'app/core/ui-services/viewport.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { ListOfSpeakersContentComponent } from 'app/shared/components/list-of-speakers-content/list-of-speakers-content.component';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ProjectionBuildDescriptor } from 'app/site/base/projection-build-descriptor';
import { ViewProjector } from 'app/site/projector/models/view-projector';
import {
    CURRENT_LIST_OF_SPEAKERS_FOLLOW,
    CurrentListOfSpeakersService
} from 'app/site/projector/services/current-list-of-speakers.service';
import { CurrentListOfSpeakersSlideService } from 'app/site/projector/services/current-list-of-speakers-slide.service';
import { Subscription } from 'rxjs';

import { ViewListOfSpeakers } from '../../models/view-list-of-speakers';

/**
 * The list of speakers for agenda items.
 */
@Component({
    selector: `os-list-of-speakers`,
    templateUrl: `./list-of-speakers.component.html`,
    styleUrls: [`./list-of-speakers.component.scss`]
})
export class ListOfSpeakersComponent extends BaseModelContextComponent implements OnInit, OnDestroy {
    @ViewChild(`content`)
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
    public canReaddLastSpeaker: boolean;

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
        protected translate: TranslateService,
        private route: ActivatedRoute,
        private listOfSpeakersRepo: ListOfSpeakersRepositoryService,
        private promptService: PromptService,
        private currentListOfSpeakersService: CurrentListOfSpeakersService,
        private currentListOfSpeakersSlideService: CurrentListOfSpeakersSlideService,
        private viewport: ViewportService,
        private collectionMapper: CollectionMapperService
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        const id = parseInt(this.route.snapshot.url[this.route.snapshot.url.length - 1]?.path, 10);
        // Check, if we are on the current list of speakers.
        this.isCurrentListOfSpeakers =
            this.route.snapshot.url.length > 0
                ? this.route.snapshot.url[this.route.snapshot.url.length - 1].path === `speakers`
                : true;

        if (this.isCurrentListOfSpeakers) {
            this.subscribe({
                viewModelCtor: ViewMeeting,
                ids: [this.activeMeetingId],
                follow: [CURRENT_LIST_OF_SPEAKERS_FOLLOW],
                fieldset: ``
            });
            this.subscriptions.push(
                this.currentListOfSpeakersService.currentListOfSpeakersObservable.subscribe(clos => {
                    this.setListOfSpeakers(clos);
                })
            );
        } else {
            this.setListOfSpeakersById(id);
        }

        this.subscriptions.push(this.viewport.isMobileSubject.subscribe(isMobile => (this.isMobile = isMobile)));
    }

    /**
     * @returns the CLOS slide build descriptor
     */
    public getClosSlide(): ProjectionBuildDescriptor {
        return this.currentListOfSpeakersSlideService.getProjectionBuildDescriptor(false);
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

        this.subscribe({
            viewModelCtor: ViewListOfSpeakers,
            ids: [id],
            follow: [
                {
                    idField: `speaker_ids`,
                    follow: [{ idField: `user_id`, fieldset: `shortName` }]
                },
                `content_object_id` // To retreive the title
            ]
        });
    }

    private setListOfSpeakers(listOfSpeakers: ViewListOfSpeakers): void {
        const title = this.isCurrentListOfSpeakers
            ? `Current list of speakers`
            : listOfSpeakers.getTitle() + ` - ${this.translate.instant(`List of speakers`)}`;
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

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        if (this.losSubscription) {
            this.losSubscription.unsubscribe();
        }
    }
}
