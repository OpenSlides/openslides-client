import { AfterViewInit, Directive, ViewChild } from '@angular/core';
import { NavigationStart } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PblColumnDefinition, PblDataSource } from '@pebula/ngrid';
import { filter } from 'rxjs';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ListComponent } from 'src/app/ui/modules/list/components';

import { StorageService } from '../../gateways/storage.service';
import { ComponentServiceCollectorService } from '../services/component-service-collector.service';
import { BaseViewModel } from './base-view-model';

const createStorageOffsetIndex = (prefix: string) => `${prefix}:offset`;
const createStorageSearchIndex = (prefix: string) => `${prefix}:search`;

@Directive()
export abstract class BaseListViewComponent<V extends BaseViewModel> extends BaseComponent implements AfterViewInit {
    @ViewChild(ListComponent)
    private readonly _listComponent: ListComponent<V> | undefined;

    /**
     * Returns the current state of the multiSelect modus
     */
    public get isMultiSelect(): boolean {
        return this._multiSelectMode;
    }

    public get dataSource(): PblDataSource<V> {
        return this._dataSource;
    }

    /**
     * NGrid column width for single buttons
     */
    public readonly singleButtonWidth = `40px`;

    /**
     * NGrid column width for single buttons with badge
     */
    public readonly badgeButtonWidth = `45px`;

    /**
     * An array of currently selected items, upon which multi select actions can be performed
     * see {@link selectItem}.
     * Filled using double binding from list-view-tables
     */
    public selectedRows: V[];

    /**
     * Force children to have a tableColumnDefinition
     */
    public abstract tableColumnDefinition: PblColumnDefinition[];

    protected get storage(): StorageService {
        return this.componentServiceCollector.storage;
    }

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
    /**
     * The source of the table data, will be filled by an event emitter
     */
    private _dataSource!: PblDataSource<V>;

    public constructor(componentServiceCollector: ComponentServiceCollectorService, translate: TranslateService) {
        super(componentServiceCollector, translate);
        this.selectedRows = [];
    }

    public ngAfterViewInit(): void {
        this.restoreScrollOffset();
        this.restoreSearchQuery();
        if (this._listComponent) {
            this.subscriptions.push(
                this.router.events
                    .pipe(filter(event => event instanceof NavigationStart))
                    .subscribe(() => this.saveScrollOffset()),
                this._listComponent.searchFilterUpdated.subscribe(nextValue => this.saveSearchQuery(nextValue))
            );
        }
    }

    /**
     * Detect changes to data source
     *
     * @param newDataSource
     */
    public onDataSourceChange(newDataSource: PblDataSource<V>): void {
        this._dataSource = newDataSource;
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
        if (this.dataSource) {
            this.dataSource.selection.select(...this.dataSource.filteredData);
        }
    }

    /**
     * Handler to quickly unselect all items.
     */
    public deselectAll(): void {
        if (this.dataSource) {
            this.dataSource.selection.clear();
        }
    }

    private saveScrollOffset(): void {
        if (this.listStorageIndex) {
            this.storage.set(createStorageOffsetIndex(this.listStorageIndex), this._listComponent!.currentOffset);
        }
    }

    private restoreScrollOffset(): void {
        if (this.listStorageIndex) {
            this.storage.get<number>(createStorageOffsetIndex(this.listStorageIndex)).then(offset => {
                if (offset) {
                    this._listComponent?.scrollTo(offset);
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
                    this._listComponent?.searchFilter(query);
                }
            });
        }
    }
}
