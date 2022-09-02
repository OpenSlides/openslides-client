import { TemplatePortal } from '@angular/cdk/portal';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AfterViewInit, Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ChangeDetectorRef, EventEmitter, HostListener, OnDestroy } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';
import { Mapable, Mutable } from 'src/app/infrastructure/utils';
import { KeyCode } from 'src/app/infrastructure/utils/key-code';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { SCROLLING_TABLE } from '../../definitions/index';
import { ScrollingTableCellDefinition } from '../../directives/scrolling-table-cell-definition';
import { ScrollingTableManageService } from '../../services/scrolling-table-manage.service';

const SELECTION_MODE_SUBSCRIPTION = `selection_mode`;
const DATA_SOURCE_SUBSCRIPTION = `data_source`;

export interface ScrollingTableRowClickEvent {}

export interface ScrollingTableSelectionChangeEvent<T> {
    affectedRows: T[];
    selected: number;
    selectedRows: T[];
}

interface DataSourceProvider<T> {
    index: number;
    isSelected: boolean;
    row: T;
}

@Component({
    selector: `os-scrolling-table`,
    templateUrl: `./scrolling-table.component.html`,
    styleUrls: [`./scrolling-table.component.scss`],
    providers: [{ provide: SCROLLING_TABLE, useExisting: ScrollingTableComponent }]
})
export class ScrollingTableComponent<T extends Partial<Mutable<Identifiable>>>
    extends BaseUiComponent
    implements AfterViewInit, OnDestroy, OnInit
{
    @ViewChild(CdkVirtualScrollViewport)
    public scrollViewport: CdkVirtualScrollViewport | undefined;

    @Input()
    public rowHeight = 70;

    @Input()
    public defaultColumnWidth: number | null = null;

    @Input()
    public showHeader = false;

    @Input()
    public hiddenColumns: string[] = [];

    @Input()
    public rowClass: string | string[] | object | undefined;

    @Input()
    public set dataSource(source: Observable<T[]>) {
        this.updateSubscription(
            DATA_SOURCE_SUBSCRIPTION,
            source.subscribe(items => {
                this._source = items;
                this.buildDataTable();
            })
        );
    }

    public get dataSource(): Observable<T[]> {
        return this._dataSource;
    }

    @Input()
    public set selectionMode(value: boolean | Observable<boolean>) {
        if (value instanceof Observable) {
            this.updateSubscription(
                SELECTION_MODE_SUBSCRIPTION,
                value.subscribe(is => (this._isSelectionMode = is))
            );
        } else {
            this._isSelectionMode = value;
        }
    }

    @Output()
    public selectionChanged = new EventEmitter<ScrollingTableSelectionChangeEvent<T>>();

    public get hasDataObservable(): Observable<boolean> {
        return this.dataSource.pipe(map(items => !!items.length));
    }

    public get ngStyle(): object {
        return {
            height: `${this.rowHeight}px`,
            maxHeight: `${this.rowHeight}px`
        };
    }

    public get isSelectionMode(): boolean {
        return this._isSelectionMode;
    }

    public get noDataTemplateObservable(): Observable<TemplatePortal> {
        return this.manageService.noDataTemplateSubject.asObservable();
    }

    public get cellHeadersObservable(): Observable<string[]> {
        return this.cellDefinitionsObservable.pipe(map(defs => defs.map(def => def.property)));
    }

    public get cellDefinitionsObservable(): Observable<ScrollingTableCellDefinition[]> {
        return this.manageService.cellDefinitionsObservable.pipe(
            map(defs => defs.filter(def => !this.hiddenColumns.includes(def.property) && !def.isHidden))
        );
    }

    public get source(): T[] {
        return this._source;
    }

    private _firstRowClicked: T | null = null;
    private _isHoldingShiftKey = false;
    private _isSelectionMode = false;
    private _source: T[] = [];
    private _dataSource = new BehaviorSubject<T[]>([]);
    private _dataSourceMap: Mapable<DataSourceProvider<T>> = {};

    public constructor(private manageService: ScrollingTableManageService, private cd: ChangeDetectorRef) {
        super();
    }

    public ngOnInit(): void {
        this.manageService.currentScrollingTableComponent = this;
        this.subscriptions.push(
            this.manageService.cellDefinitionsObservable.subscribe(def => {
                this.cd.markForCheck();
            })
        );
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.manageService.currentScrollingTableComponent = null;
        this.manageService.clearRegistry();
    }

    public ngAfterViewInit(): void {
        this.cd.markForCheck();
        this.cd.detectChanges();
    }

    public selectAll(): void {
        this.changeSelection(this._source, true);
    }

    public deselectAll(): void {
        this.changeSelection(this._source, false);
    }

    private select(rows: T[]): void {
        this.changeSelection(rows, true);
    }

    public onRowClick(event: Event, row: T): void {
        event.stopPropagation();
        if (this.isSelectionMode) {
            this.changeSelection([row]);

            if (this._isHoldingShiftKey && this._firstRowClicked) {
                const firstIndex = this._source.findIndex(item => item === this._firstRowClicked);
                const secondIndex = this._source.findIndex(item => item === row);
                const from = Math.min(firstIndex, secondIndex);
                const to = Math.max(firstIndex, secondIndex);
                this.select(this._source.slice(from, to));
                this._firstRowClicked = null;
            } else {
                this._firstRowClicked = row;
            }
        }
    }

    @HostListener(`document:keydown`, [`$event`])
    public onKeyDown(keyEvent: KeyboardEvent): void {
        if (keyEvent.key === KeyCode.SHIFT) {
            this._isHoldingShiftKey = true;
        }
    }

    @HostListener(`document:keyup`, [`$event`])
    public onKeyUp(keyEvent: KeyboardEvent): void {
        if (keyEvent.key === KeyCode.SHIFT) {
            this._isHoldingShiftKey = false;
        }
    }

    public isSelected(row: T): boolean {
        return this._dataSourceMap[row.id].isSelected;
    }

    private buildDataTable(): void {
        const source = this._source.sort((a, b) => a.id - b.id);
        const sourceMapKeys = Object.keys(this._dataSourceMap)
            .map(key => Number(key))
            .sort((a, b) => a - b);
        let toDelete: number[] = [];
        let currentId = 0;
        for (let i = 0; i < source.length; i++) {
            while (currentId < sourceMapKeys.length && source[i].id >= sourceMapKeys[currentId]) {
                if (source[i].id > sourceMapKeys[currentId]) {
                    toDelete.push(sourceMapKeys[currentId]);
                }
                currentId++;
            }
            this.addOrChangeItemInDataSourceMap(source[i]);
        }
        if (currentId < sourceMapKeys.length) {
            toDelete = toDelete.concat(sourceMapKeys.slice(currentId));
        }
        this.deleteFromDataSourceMap(toDelete);
        this.refresh();
    }

    private addOrChangeItemInDataSourceMap(item: T): void {
        this._dataSourceMap[item.id] = {
            index: item.id,
            isSelected: this._dataSourceMap[item.id]?.isSelected || false,
            row: item
        };
    }

    private deleteFromDataSourceMap(toDeleteIds: number[]): void {
        if (toDeleteIds.length) {
            for (const index of toDeleteIds) {
                delete this._dataSourceMap[index];
            }
            this.onAfterSelectionChanged(this._source);
        }
    }

    private changeSelection(rows: T[], isChecked?: boolean): void {
        this.onBeforeSelectionChanged(rows, isChecked);
        this.onAfterSelectionChanged(rows);
    }

    private onBeforeSelectionChanged(rows: T[], isChecked?: boolean): void {
        for (const row of rows) {
            const index = row.id;
            this._dataSourceMap[index].isSelected = isChecked ?? !this._dataSourceMap[index].isSelected;
        }
    }

    private onAfterSelectionChanged(affectedRows: T[]): void {
        const rows = Object.values(this._dataSourceMap)
            .filter(provider => provider.isSelected)
            .map(provider => provider.row);
        this.selectionChanged.emit({ affectedRows, selected: rows.length, selectedRows: rows });
    }

    private refresh(): void {
        this._dataSource.next(this._source);
        this.cd.markForCheck();
    }
}
