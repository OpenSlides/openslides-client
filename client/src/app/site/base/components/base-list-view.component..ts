import { OnDestroy } from '@angular/core';

import { PblColumnDefinition, PblDataSource } from '@pebula/ngrid';

import { StorageService } from 'app/core/core-services/storage.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseModelContextComponent } from './base-model-context.component';
import { BaseViewModel } from '../base-view-model';

export abstract class BaseListViewComponent<V extends BaseViewModel>
    extends BaseModelContextComponent
    implements OnDestroy {
    /**
     * The source of the table data, will be filled by an event emitter
     */
    public dataSource: PblDataSource<V>;

    /**
     * Toggle for enabling the multiSelect mode. Defaults to false (inactive)
     */
    protected canMultiSelect = false;

    /**
     * Current state of the multi select mode. TODO Could be merged with edit mode?
     */
    private _multiSelectMode = false;

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

    /**
     * NGrid column width for single buttons
     */
    public singleButtonWidth = '40px';

    /**
     * NGrid column width for single buttons with badge
     */
    public badgeButtonWidth = '45px';

    protected get storage(): StorageService {
        return this.componentServiceCollector.storage;
    }

    public constructor(componentServiceCollector: ComponentServiceCollector) {
        super(componentServiceCollector);
        this.selectedRows = [];
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    /**
     * Detect changes to data source
     *
     * @param newDataSource
     */
    public onDataSourceChange(newDataSource: PblDataSource<V>): void {
        this.dataSource = newDataSource;
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
        this.dataSource.selection.select(...this.dataSource.filteredData);
    }

    /**
     * Handler to quickly unselect all items.
     */
    public deselectAll(): void {
        if (this.dataSource) {
            this.dataSource.selection.clear();
        }
    }

    /**
     * Returns the current state of the multiSelect modus
     */
    public get isMultiSelect(): boolean {
        return this._multiSelectMode;
    }
}
