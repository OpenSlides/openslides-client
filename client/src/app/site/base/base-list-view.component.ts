import { AfterViewInit, Directive, ViewChild } from '@angular/core';
import { NavigationStart } from '@angular/router';
import { filter } from 'rxjs';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ListComponent } from 'src/app/ui/modules/list/components';
import {
    END_POSITION,
    START_POSITION
} from 'src/app/ui/modules/scrolling-table/directives/scrolling-table-cell-position';

import { BaseViewModel } from './base-view-model';

const createStorageOffsetIndex = (prefix: string) => `${prefix}:offset`;
const createStorageSearchIndex = (prefix: string) => `${prefix}:search`;

@Directive()
export abstract class BaseListViewComponent<V extends BaseViewModel> extends BaseComponent implements AfterViewInit {
    public readonly END_POSITION = END_POSITION;
    public readonly START_POSITION = START_POSITION;

    @ViewChild(ListComponent)
    protected readonly listComponent: ListComponent<V> | undefined;

    /**
     * Returns the current state of the multiSelect modus
     */
    public get isMultiSelect(): boolean {
        return this._multiSelectMode;
    }

    /**
     * An array of currently selected items, upon which multi select actions can be performed
     * see {@link selectItem}.
     * Filled using double binding from list-view-tables
     */
    public selectedRows: V[];

    /**
     * Toggle for enabling the multiSelect mode. Defaults to false (inactive)
     */
    protected canMultiSelect = false;

    /**
     * An optional index: If it is provided, the search and scroll-offset will be stored in an IndexedDB.
     */
    protected listStorageIndex: string | null = null;

    /**
     * Current state of the multi select mode. TODO Could be merged with edit mode?
     */
    private _multiSelectMode = false;

    public constructor() {
        super();
        this.selectedRows = [];
    }

    public ngAfterViewInit(): void {
        this.restoreScrollOffset();
        this.restoreSearchQuery();
        if (this.listComponent) {
            this.subscriptions.push(
                this.router.events
                    .pipe(filter(event => event instanceof NavigationStart))
                    .subscribe(() => this.saveScrollOffset()),
                this.listComponent.searchFilterUpdated.subscribe(nextValue => this.saveSearchQuery(nextValue))
            );
        }
    }

    /**
     * enables/disables the multiSelect Mode
     */
    public toggleMultiSelect(): void {
        if (!this.canMultiSelect || this.isMultiSelect) {
            this._multiSelectMode = false;
            this.deselectAll();
        } else {
            this._multiSelectMode = true;
        }
    }

    /**
     * Select all files in the current data source
     */
    public selectAll(): void {
        if (this.listComponent) {
            this.listComponent.selectAll();
        }
    }

    /**
     * Handler to quickly unselect all items.
     */
    public deselectAll(): void {
        if (this.listComponent) {
            this.listComponent.deselectAll();
        }
    }

    private saveScrollOffset(): void {
        if (this.listStorageIndex) {
            this.storage.set(createStorageOffsetIndex(this.listStorageIndex), this.listComponent?.currentOffset);
        }
    }

    private restoreScrollOffset(): void {
        if (this.listStorageIndex) {
            this.storage.get<number>(createStorageOffsetIndex(this.listStorageIndex)).then(offset => {
                if (offset) {
                    this.listComponent?.scrollTo(offset);
                }
            });
        }
    }

    private saveSearchQuery(query: string): void {
        if (this.listStorageIndex) {
            this.storage.set(createStorageSearchIndex(this.listStorageIndex), query);
        }
    }

    private restoreSearchQuery(): void {
        if (this.listStorageIndex) {
            this.storage.get<string>(createStorageSearchIndex(this.listStorageIndex)).then(query => {
                if (query) {
                    this.listComponent?.searchFilter(query);
                }
            });
        }
    }
}
