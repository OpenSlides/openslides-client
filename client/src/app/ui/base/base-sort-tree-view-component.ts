import { Directive, EventEmitter, inject, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SortDefinition } from 'src/app/site/base/base-sort.service';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { CanComponentDeactivate } from 'src/app/site/guards/watch-for-changes.guard';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { SortingTreeComponent } from '../modules/sorting/modules/sorting-tree/components/sorting-tree/sorting-tree.component';

export type SortTreeFilterId = string | number;

export interface SortTreeFilterOption {
    label: string;
    id: SortTreeFilterId;
    state: boolean;
}

/**
 * Abstract Sort view for hierarchic item trees
 */
@Directive()
export abstract class BaseSortTreeViewComponent<V extends BaseViewModel>
    extends BaseUiComponent
    implements CanComponentDeactivate
{
    /**
     * Reference to the view child
     */
    @ViewChild(`osSortedTree`, { static: true })
    public osSortTree: SortingTreeComponent<V> | null = null;

    /**
     * Emitter to emit if the nodes should expand or collapse.
     */
    public readonly changeState: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**
     * Emitter that emits the filters to the sorting tree.
     * TODO note that the boolean function currently requires false if the item
     * is to be visible!
     */
    public readonly changeFilter: EventEmitter<(item: V) => boolean> = new EventEmitter<(item: V) => boolean>();

    /**
     * Emitter to notice the `tree-sorting.service` for sorting the data-source.
     */
    public readonly forceSort = new EventEmitter<SortDefinition<V>>();

    /**
     * Boolean to check if changes has been made.
     */
    public hasChanged = false;

    /**
     * Boolean to check if filters are active, so they could be removed.
     */
    public hasActiveFilter = false;

    /**
     * Array that holds the number of visible nodes(0) and amount of available
     * nodes(1).
     */
    public seenNodes: [number, number] = [0, 0];

    protected translate = inject(TranslateService);
    protected promptService = inject(PromptService);

    /**
     * Function to restore the old state.
     */
    public async onCancel(): Promise<void> {
        if (await this.canDeactivate()) {
            this.osSortTree?.setSubscription();
        }
    }

    /**
     * Function to set an info if changes has been made.
     *
     * @param hasChanged Boolean received from the tree to see that changes has been made.
     */
    public receiveChanges(hasChanged: boolean): void {
        this.hasChanged = hasChanged;
    }

    /**
     * Function to receive the new number of visible nodes when the filter has changed.
     *
     * @param nextNumberOfSeenNodes is an array with two indices:
     * The first gives the number of currently shown nodes.
     * The second tells how many nodes available.
     */
    public onChangeAmountOfItems(nextNumberOfSeenNodes: [number, number]): void {
        this.seenNodes = nextNumberOfSeenNodes;
    }

    /**
     * Function to emit if the nodes should be expanded or collapsed.
     *
     * @param nextState Is the next state, expanded or collapsed, the nodes should be.
     */
    public onStateChange(nextState: boolean): void {
        this.changeState.emit(nextState);
    }

    /**
     * Function to open a prompt dialog, so the user will be warned if they have
     * made changes and not saved them.
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
