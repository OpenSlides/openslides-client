import { ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { PblColumnDefinition } from '@pebula/ngrid';
import { PblNgridRowContext } from '@pebula/ngrid/lib/grid';

import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { StorageService } from 'app/core/core-services/storage.service';
import { ProjectorService } from 'app/core/ui-services/projector.service';
import { ViewportService } from 'app/core/ui-services/viewport.service';
import { hasListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { HasListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { isProjectable } from 'app/site/base/projectable';
import { BasicListViewTableComponent } from '../basic-list-view-table/basic-list-view-table.component';

export interface CssClassDefinition {
    [key: string]: boolean;
}

/**
 * To hide columns via restriction
 */
export interface ColumnRestriction {
    columnName: string;
    permission: Permission;
}

/**
 * Powerful list view table component.
 *
 * Creates a sort-filter-bar and table with virtual scrolling, where projector and multi select is already
 * embedded
 *
 * Takes a repository-service (or simple Observable), a sort-service and a filter-service as an input to display data
 * Requires multi-select information
 * Double binds selected rows
 *
 * required both columns definition and a transclusion slot using the ".columns" slot as selector
 *
 * Can inform about changes in the DataSource
 *
 * !! Due to bugs in Firefox, ALL inputs to os-list-view-table need to be simple objects.
 *    NO getter, NO return of a function
 *    If otherwise more logic is required, use `changeDetectionStrategy.OnPush`
 *    in your component
 *
 * @example
 * ```html
 * <os-list-view-table
 *     [listObservableProvider]="motionRepo"
 *     [filterService]="filterService"
 *     [filterProps]="filterProps"
 *     [sortService]="sortService"
 *     [columns]="motionColumnDefinition"
 *     [restricted]="restrictedColumns"
 *     [hiddenInMobile]="['state']"
 *     [allowProjector]="false"
 *     [multiSelect]="isMultiSelect"
 *     listStorageKey="motion"
 *     [(selectedRows)]="selectedRows"
 *     (dataSourceChange)="onDataSourceChange($event)"
 * >
 *     <div *pblNgridCellDef="'number'; row as motion" class="cell-slot">
 *         {{ motion.number }}
 *     </div>
 * </os-list-view-table>
 * ```
 */
@Component({
    selector: 'os-list-view-table',
    templateUrl: './list-view-table.component.html',
    styleUrls: ['../basic-list-view-table/basic-list-view-table.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ListViewTableComponent<
    V extends BaseViewModel | BaseProjectableViewModel
> extends BasicListViewTableComponent<V> {
    /**
     * If a Projector column should be shown (at all)
     */
    @Input()
    private allowProjector = true;

    /**
     * If the speaker tab should appear
     */
    @Input()
    public showListOfSpeakers = true;

    @Input()
    public getSpeakerButtonObject: (viewModel: V) => (BaseViewModel & HasListOfSpeakers) | null = null;

    public readonly permission = Permission;

    private get projectorColumnWidth(): number {
        if (this.operator.hasPerms(Permission.projectorCanManage)) {
            return 60;
        } else {
            return 24;
        }
    }

    /**
     * Most, of not all list views require these
     */
    @Input()
    public startColumnDefinitions: PblColumnDefinition[] = [
        {
            prop: 'selection',
            label: '',
            width: '40px'
        },
        {
            prop: 'projector',
            label: '',
            width: `${this.projectorColumnWidth}px`
        }
    ];

    /**
     * End columns
     */
    @Input()
    public endColumnDefinitions: PblColumnDefinition[] = [
        {
            prop: 'speaker',
            label: '',
            width: '45px'
        },
        {
            prop: 'menu',
            label: '',
            width: '40px'
        }
    ];

    /**
     * Yep it's a constructor.
     *
     * @param store: Access the scroll storage key
     */
    public constructor(
        vp: ViewportService,
        router: Router,
        cd: ChangeDetectorRef,
        store: StorageService,
        private operator: OperatorService,
        public projectorService: ProjectorService
    ) {
        super(vp, router, cd, store);
    }

    public isElementProjected = (context: PblNgridRowContext<V>) => {
        const viewModel = context.$implicit as V;
        if (this.allowProjector && isProjectable(viewModel) && this.projectorService.isProjected(viewModel)) {
            return 'projected';
        }
    };

    public _getSpeakerButtonObject(viewModel: V): HasListOfSpeakers | null {
        if (this.getSpeakerButtonObject === null) {
            if (hasListOfSpeakers(viewModel)) {
                return viewModel;
            }
        } else {
            return this.getSpeakerButtonObject(viewModel);
        }
    }

    @Input()
    public toRestrictFn = (restriction: ColumnRestriction) => !this.operator.hasPerms(restriction.permission);

    @Input()
    public toHideFn = () => {
        const columnsToHide = [];

        // hide the projector columns
        if (this.multiSelect || this.isMobile || !this.allowProjector) {
            columnsToHide.push('projector');
        }

        // hide the speakers in mobile
        if (this.isMobile || !this.showListOfSpeakers || !this.operator.hasPerms(Permission.listOfSpeakersCanSee)) {
            columnsToHide.push('speaker');
        }

        return columnsToHide;
    };
}
