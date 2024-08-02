import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { CanComponentDeactivate } from 'src/app/site/guards/watch-for-changes.guard';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewMotionCategory } from 'src/app/site/pages/meetings/pages/motions';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';
import { SortingTreeComponent } from 'src/app/ui/modules/sorting/modules/sorting-tree/components/sorting-tree/sorting-tree.component';

import { MotionCategoryControllerService } from '../../../../modules/categories/services';

@Component({
    selector: `os-category-list-sort`,
    templateUrl: `./category-list-sort.component.html`,
    styleUrls: [`./category-list-sort.component.scss`]
})
export class CategoryListSortComponent extends BaseMeetingComponent implements CanComponentDeactivate {
    /**
     * Reference to the sorting tree.
     */
    @ViewChild(`osSortedTree`, { static: true })
    private osSortTree!: SortingTreeComponent<ViewMotionCategory>;

    /**
     * All motions sorted first by weight, then by id.
     */
    public categoriesObservable: Observable<ViewMotionCategory[]>;

    /**
     * Boolean to check if the tree has changed.
     */
    public hasChanged = false;

    public constructor(
        protected override translate: TranslateService,
        private categoryRepo: MotionCategoryControllerService,
        private promptService: PromptService
    ) {
        super();
        this.categoriesObservable = this.categoryRepo.getViewModelListObservable();
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
            return await this.promptService.discardChangesConfirmation();
        }
        return true;
    }
}
