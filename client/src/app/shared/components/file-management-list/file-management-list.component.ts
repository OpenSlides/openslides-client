import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { columnFactory, createDS, PblColumnDefinition, PblDataSource } from '@pebula/ngrid';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { PblNgridDataMatrixRow } from '@pebula/ngrid/target-events';
import { Id } from 'app/core/definitions/key-types';

export interface DirectoryObservableProvider<V> {
    getDirectoryListObservable(directoryId: Id | null): Observable<V[]>;
}

@Component({
    selector: 'os-file-management-list',
    templateUrl: './file-management-list.component.html',
    styleUrls: ['./file-management-list.component.scss']
})
export class FileManagementListComponent<V> implements OnInit {
    @Input()
    public directoryObservableProvider: DirectoryObservableProvider<V>;

    public readonly canEdit = true;

    public isMultiSelectMode = false;

    public directory: V | null = null;
    public directoryChain: V[];

    /**
     * Determine generally hidden columns
     */
    public get hiddenColumns(): string[] {
        const hidden = [];
        if (!this.canEdit) {
            hidden.push(`info`);
        }

        if (!this.isMultiSelectMode) {
            hidden.push(`selection`);
        }

        // if (!this.canAccessFileMenu) {
        //     hidden.push(`menu`);
        // }

        return hidden;
    }

    /**
     * Define the column definition
     */
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: `selection`,
            width: `40px`
        },
        {
            prop: `icon`,
            label: ``,
            width: `40px`
        },
        {
            prop: `title`,
            width: `100%`,
            minWidth: 60
        },
        {
            prop: `info`,
            width: `20%`,
            minWidth: 60
        },
        {
            prop: `indicator`,
            label: ``,
            width: `40px`
        },
        {
            prop: `menu`,
            label: ``,
            width: `40px`
        }
    ];

    /**
     * Create the column set
     */
    public columnSet = columnFactory()
        .table(...this.tableColumnDefinition)
        .build();

    public dataSource: PblDataSource<V>;

    private directoryObservable: Observable<V[]> = new Observable();
    private folderSubscription: Subscription;
    private directorySubscription: Subscription;
    private selectedRows: V[];

    public constructor(private router: Router, private cd: ChangeDetectorRef) {}

    public ngOnInit(): void {
        this.dataSource = this.createDataSource();
    }

    /**
     * TODO: This is basically a duplicate of onSelectRow of ListViewTableComponent
     */
    public onSelectRow(event: PblNgridDataMatrixRow<V>): void {
        if (this.isMultiSelectMode) {
            const clickedModel: V = event.row;
            const alreadySelected = this.dataSource.selection.isSelected(clickedModel);
            if (alreadySelected) {
                this.dataSource.selection.deselect(clickedModel);
            } else {
                this.dataSource.selection.select(clickedModel);
            }
        }
    }

    public changeDirectory(directoryId: Id | null): void {
        this.clearSubscriptions();

        this.directoryObservable = this.directoryObservableProvider.getDirectoryListObservable(directoryId);
        // this.directoryObservable = this.repo.getListObservableDirectory(directoryId);
        this.folderSubscription = this.directoryObservable.subscribe(mediafiles => {
            if (mediafiles) {
                this.dataSource.refresh();
                this.cd.markForCheck();
            }
        });

        if (directoryId) {
            // this.directorySubscription = this.repo.getViewModelObservable(directoryId).subscribe(newDirectory => {
            //     this.directory = newDirectory;
            //     if (newDirectory) {
            //         this.directoryChain = newDirectory.getDirectoryChain();
            //         // Update the URL.
            //         // this.router.navigate([this.activeMeetingId, `mediafiles`, newDirectory.id]);
            //     } else {
            //         this.directoryChain = [];
            //         // this.router.navigate([this.activeMeetingId, `mediafiles`]);
            //     }
            // });
        } else {
            this.directory = null;
            this.directoryChain = [];
            // this.router.navigate([`mediafiles`], { relativeTo: this.route.parent });
        }
    }

    /**
     * TODO: Swap logic to only create DS once and update on filder change
     * @param mediafiles
     */
    private createDataSource(): PblDataSource<V> {
        const dataSource = createDS<V>()
            .onTrigger(() => this.directoryObservable)
            .create();

        dataSource.selection.changed.subscribe(selection => {
            this.selectedRows = selection.source.selected;
        });
        return dataSource;
    }

    private clearSubscriptions(): void {
        if (this.folderSubscription) {
            this.folderSubscription.unsubscribe();
            this.folderSubscription = null;
        }
        if (this.directorySubscription) {
            this.directorySubscription.unsubscribe();
            this.directorySubscription = null;
        }
    }
}
