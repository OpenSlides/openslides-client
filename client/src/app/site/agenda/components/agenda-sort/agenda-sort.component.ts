import { Component, OnInit } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { AgendaItemRepositoryService } from 'app/core/repositories/agenda/agenda-item-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ItemVisibilityChoices } from 'app/shared/models/agenda/agenda-item';
import { BaseSortTreeComponent, SortTreeFilterOption } from 'app/site/base/components/sort-tree.component';
import { ViewAgendaItem } from '../../models/view-agenda-item';

/**
 * Sort view for the agenda.
 */
@Component({
    selector: 'os-agenda-sort',
    templateUrl: './agenda-sort.component.html',
    styleUrls: ['./agenda-sort.component.scss']
})
export class AgendaSortComponent extends BaseSortTreeComponent<ViewAgendaItem> implements OnInit {
    /**
     * All agendaItems sorted by their weight {@link ViewItem.weight}
     */
    public itemsObservable: Observable<ViewAgendaItem[]>;

    /**
     * These are the available options for filtering the nodes.
     * Adds the property `state` to identify if the option is marked as active.
     * When reset the filters, the option `state` will be set to `false`.
     */
    public filterOptions: SortTreeFilterOption[] = ItemVisibilityChoices.map(item => {
        return { label: item.name, id: item.key, state: false };
    });

    /**
     * BehaviourSubject to get informed every time the filters change.
     */
    protected activeFilters: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);

    /**
     * Updates the incoming/changing agenda items.
     * @param title
     * @param translate
     * @param matSnackBar
     * @param agendaRepo
     * @param promptService
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        promptService: PromptService,
        private agendaRepo: AgendaItemRepositoryService
    ) {
        super(componentServiceCollector, promptService);
        this.itemsObservable = this.agendaRepo.getViewModelListObservable();
    }

    /**
     * Function to emit the active filters.
     * Filters will be stored in an array to prevent duplicated options.
     * Furthermore if the option is already included in this array, then it will be deleted.
     * This array will be emitted.
     *
     * @param filter Is the filter that was activated by the user.
     */
    public onFilterChange(filter: number): void {
        const value = this.activeFilters.value;
        if (!value.includes(filter)) {
            value.push(filter);
        } else {
            value.splice(value.indexOf(filter), 1);
        }
        this.activeFilters.next(value);
    }

    /**
     * OnInit method
     */
    public ngOnInit(): void {
        /**
         * Passes the active filters as an array to the subject.
         */
        const filter = this.activeFilters.subscribe((value: number[]) => {
            this.hasActiveFilter = value.length === 0 ? false : true;
            this.changeFilter.emit((item: ViewAgendaItem): boolean => {
                return !(value.includes(item.type) || value.length === 0);
            });
        });
        this.subscriptions.push(filter);
    }

    /**
     * Function to set the active filters to null.
     */
    public resetFilters(): void {
        for (const option of this.filterOptions) {
            option.state = false;
        }
        this.activeFilters.next([]);
    }

    /**
     * Function to save the tree by click.
     */
    public async onSave(): Promise<void> {
        await this.agendaRepo
            .sortItems(this.osSortTree.getTreeData())
            .then(() => this.osSortTree.setSubscription(), this.raiseError);
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
     * Function, that returns an icon depending on the given tag.
     *
     * @param tag of which the icon will be assigned to.
     *
     * @returns The icon it should be.
     */
    public getIcon(type: string): string {
        switch (type.toLowerCase()) {
            case 'public item':
                return 'public';
            case 'internal item':
                return 'visibility';
            case 'hidden item':
                return 'visibility_off';
        }
    }
}
