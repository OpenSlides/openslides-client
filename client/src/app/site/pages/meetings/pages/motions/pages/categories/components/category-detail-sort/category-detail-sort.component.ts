import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { CanComponentDeactivate } from 'src/app/site/guards/watch-for-changes.guard';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewMotion, ViewMotionCategory } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { ChoiceService } from 'src/app/ui/modules/choice-dialog';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';
import { SortingListComponent } from 'src/app/ui/modules/sorting/modules/sorting-list/components/sorting-list/sorting-list.component';

import { MotionCategoryControllerService } from '../../../../modules/categories/services';
import { MotionControllerService } from '../../../../services/common/motion-controller.service';

/**
 * View for rearranging and renumbering the motions of a category. The {@link onNumberMotions}
 * method sends a request to the server to re-number the given motions in the order
 * as displayed in this view
 */
@Component({
    selector: `os-category-detail-sort`,
    templateUrl: `./category-detail-sort.component.html`,
    styleUrls: [`./category-detail-sort.component.scss`]
})
export class CategoryDetailSortComponent extends BaseMeetingComponent implements CanComponentDeactivate {
    public readonly COLLECTION = ViewMotionCategory.COLLECTION;

    /**
     * The current category. Determined by the route
     */
    public category: ViewMotionCategory | null = null;

    /**
     * A behaviorSubject emitting the currently asigned motions on change
     */
    public motionsSubject = new BehaviorSubject<ViewMotion[]>([]);

    /**
     * Counter indicating the amount of motions currently in the category
     */
    public motionsCount = 0;

    /**
     * Flag to define if the list has changed.
     */
    public hasChanged = false;

    /**
     * Copied array of the motions in this category
     */
    private motionsCopy: ViewMotion[] = [];

    /**
     * Array that contains the initial list of motions.
     * Necessary to reset the list.
     */
    private motionsBackup: ViewMotion[] = [];

    public get isMultiSelect(): boolean {
        return this.sortSelector!.multiSelectedIndex.length > 0;
    }

    /**
     * @returns an observable for the {@link motionsSubject}
     */
    public get motionObservable(): Observable<ViewMotion[]> {
        return this.motionsSubject.asObservable();
    }

    /**
     * The Sort Component
     */
    @ViewChild(`sorter`, { static: true })
    public sortSelector!: SortingListComponent;

    private _categoryId: number;

    private _hasCategoryId = false;

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private promptService: PromptService,
        private repo: MotionCategoryControllerService,
        private route: ActivatedRoute,
        private motionRepo: MotionControllerService,
        private choiceService: ChoiceService
    ) {
        super(componentServiceCollector, translate);
    }

    public onIdFound(id: Id | null): void {
        this._categoryId = id;
        this.createMotionSubscriptions();
    }

    /**
     * Listener for the sorting event in the `sorting-list`.
     *
     * @param motions ViewMotion[]: The sorted array of motions.
     */
    public onListUpdate(motions: any[]): void {
        this.hasChanged = true;
        this.motionsCopy = motions;
    }

    /**
     * Resets the current list.
     */
    public async onCancel(): Promise<void> {
        if (await this.canDeactivate()) {
            this.motionsSubject.next([]);
            this.initializeList(this.motionsBackup);
            this.hasChanged = false;
        }
    }

    /**
     * This function sends the changed list.
     * Only an array containing ids from the motions will be sent.
     */
    public async sendUpdate(): Promise<void> {
        const title = this.translate.instant(`Do you really want to save your changes?`);
        if (await this.promptService.open(title)) {
            const ids = this.motionsCopy.map(motion => motion.id);
            this.repo.sortMotionsInCategory(this.category!, ids);
            this.hasChanged = false;
        }
    }

    /**
     * Function to open a prompt dialog,
     * so the user will be warned if he has made changes and not saved them.
     *
     * @returns The result from the prompt dialog.
     */
    public async canDeactivate(): Promise<boolean> {
        if (this.hasChanged) {
            return await this.promptService.discardChangesConfirmation();
        }
        return true;
    }

    public async moveToPosition(): Promise<void> {
        if (this.sortSelector.multiSelectedIndex.length) {
            const content = this.translate.instant(`Move selected items ...`);
            const choices = this.sortSelector.sortedItems.filter(
                f => !this.sortSelector.multiSelectedIndex.includes(f.id)
            );
            const actions = [this.translate.instant(`Insert before`), this.translate.instant(`Insert behind`)];
            const selectedChoice = await this.choiceService.open(content, choices, false, actions);
            if (selectedChoice) {
                const newIndex = selectedChoice.firstId;

                this.sortSelector.drop(
                    {
                        currentIndex: newIndex,
                        previousIndex: 0
                    },
                    selectedChoice.action === actions[1] // true if 'insert behind'
                );
            }
        }
    }

    private createMotionSubscriptions(): void {
        if (!this._hasCategoryId) {
            this._hasCategoryId = true;
            this.subscriptions.push(
                this.repo.getViewModelObservable(this._categoryId).subscribe(cat => {
                    this.category = cat;
                }),
                this.motionRepo.getViewModelListObservable().subscribe(motions => {
                    const filtered = motions.filter(m => m.category_id === this._categoryId);
                    this.motionsBackup = [...filtered];
                    this.motionsCount = filtered.length;
                    if (this.motionsCopy.length === 0) {
                        this.initializeList(filtered);
                    } else {
                        this.motionsSubject.next(this.handleMotionUpdates(filtered));
                    }
                })
            );
        }
    }

    /**
     * Function to (re-)set the current list of motions.
     *
     * @param motions An array containing the new motions.
     */
    private initializeList(motions: ViewMotion[]): void {
        motions.sort((a, b) => a.category_weight - b.category_weight);
        this.motionsSubject.next(motions);
        this.motionsCopy = motions;
    }

    /**
     * This function handles the incoming motions after the user sorted them previously.
     *
     * @param nextMotions are the motions that are received from the server.
     *
     * @returns An array containing the new motions or not the removed motions.
     */
    private handleMotionUpdates(nextMotions: ViewMotion[]): ViewMotion[] {
        const copy = this.motionsCopy;
        if (nextMotions.length > copy.length) {
            for (const motion of nextMotions) {
                if (
                    !Object.values(copy)
                        .map(motion => motion.id)
                        .includes(motion.id)
                ) {
                    copy.push(motion);
                }
            }
        } else if (nextMotions.length < copy.length) {
            for (const motion of copy) {
                if (
                    !Object.values(nextMotions)
                        .map(motion => motion.id)
                        .includes(motion.id)
                ) {
                    copy.splice(copy.indexOf(motion), 1);
                }
            }
        } else {
            for (const motion of copy) {
                if (
                    !Object.values(nextMotions)
                        .map(motion => motion.id)
                        .includes(motion.id)
                ) {
                    const updatedMotion = nextMotions.find(theMotion => theMotion.id === motion.id);
                    copy.splice(copy.indexOf(motion), 1, updatedMotion!);
                }
            }
        }
        return copy;
    }
}
