import { Component, ViewChild } from '@angular/core';

import { Observable } from 'rxjs';

import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { MotionCategoryRepositoryService } from 'app/core/repositories/motions/motion-category-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { SortingTreeComponent } from 'app/shared/components/sorting-tree/sorting-tree.component';
import { CanComponentDeactivate } from 'app/shared/utils/watch-for-changes.guard';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewMotionCategory } from 'app/site/motions/models/view-motion-category';

/**
 * Sort view for the call list.
 */
@Component({
    selector: 'os-categories-sort',
    templateUrl: './categories-sort.component.html',
    styleUrls: ['./categories-sort.component.scss']
})
export class CategoriesSortComponent extends BaseModelContextComponent implements CanComponentDeactivate {
    /**
     * Reference to the sorting tree.
     */
    @ViewChild('osSortedTree', { static: true })
    private osSortTree: SortingTreeComponent<ViewMotionCategory>;

    /**
     * All motions sorted first by weight, then by id.
     */
    public categoriesObservable: Observable<ViewMotionCategory[]>;

    /**
     * Boolean to check if the tree has changed.
     */
    public hasChanged = false;

    /**
     * Updates the motions member, and sorts it.
     * @param title
     * @param translate
     * @param matSnackBar
     * @param categoryRepo
     * @param promptService
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private activeMeetingIdService: ActiveMeetingIdService,
        private categoryRepo: MotionCategoryRepositoryService,
        private promptService: PromptService
    ) {
        super(componentServiceCollector);
        this.categoriesObservable = this.categoryRepo.getViewModelListObservable();
    }

    public getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingIdService.meetingId],
            follow: [
                {
                    idField: 'motion_category_ids',
                    fieldset: 'sortList'
                }
            ]
        };
    }

    /**
     * Function to save changes on click.
     */
    public async onSave(): Promise<void> {
        await this.categoryRepo
            .sortCategories(this.osSortTree.getTreeData())
            .then(() => this.osSortTree.setSubscription(), this.raiseError);
    }

    /**
     * Function to restore the old state.
     */
    public async onCancel(): Promise<void> {
        if (await this.canDeactivate()) {
            this.osSortTree.setSubscription();
        }
    }

    /**
     * Function to get an info if changes has been made.
     *
     * @param hasChanged Boolean received from the tree to see that changes has been made.
     */
    public receiveChanges(hasChanged: boolean): void {
        this.hasChanged = hasChanged;
    }

    /**
     * Function to open a prompt dialog,
     * so the user will be warned if he has made changes and not saved them.
     *
     * @returns The result from the prompt dialog.
     */
    public async canDeactivate(): Promise<boolean> {
        if (this.hasChanged) {
            const title = this.translate.instant('Do you really want to exit this page?');
            const content = this.translate.instant('You made changes.');
            return await this.promptService.open(title, content);
        }
        return true;
    }
}
