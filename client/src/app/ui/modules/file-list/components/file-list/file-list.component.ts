import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { columnFactory, createDS, PblColumnDefinition, PblDataSource } from '@pebula/ngrid';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Mediafile } from 'src/app/domain/models/mediafiles/mediafile';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';

interface MoveEvent {
    files: ViewMediafile[];
    directoryId: Id;
}

interface SelectEvent {
    files: ViewMediafile[];
}

interface SaveEvent {
    update: Partial<Mediafile> | null;
}

interface DeleteEvent {
    file: ViewMediafile;
}

interface DirectoryChangeEvent {
    directoryId: Id | null;
}

interface BeforeEditingEvent {
    file: ViewMediafile;
}

@Component({
    selector: `os-file-list`,
    templateUrl: `./file-list.component.html`,
    styleUrls: [`./file-list.component.scss`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileListComponent implements OnInit, OnDestroy {
    @Input()
    public editFolderTemplate: TemplateRef<any> | null = null;

    @Input()
    public fileMenuTemplate: TemplateRef<any> | null = null;

    @Input()
    public isMultiSelect = false;

    @Input()
    public canEdit = false;

    @Input()
    public canAccessFileMenu = false;

    /**
     * Determine generally hidden columns
     */
    public get hiddenColumns(): string[] {
        const hidden = [];
        if (!this.canEdit) {
            hidden.push(`info`);
        }

        if (!this.isMultiSelect) {
            hidden.push(`selection`);
        }

        if (!this.canAccessFileMenu) {
            hidden.push(`menu`);
        }

        return hidden;
    }

    public dataSource!: PblDataSource<ViewMediafile>;

    @Input()
    public set currentDirectory(directory: ViewMediafile | null) {
        if (directory) {
            this._directoryChain = directory.getDirectoryChain();
        } else {
            this._directoryChain = [];
        }
    }

    @Input()
    public sourceFiles!: Observable<ViewMediafile[]> | ViewMediafile[];

    @Input()
    public tooltipFn: (file: ViewMediafile) => string = () => ``;

    @Input()
    public shouldShowFileMenuFn: (file: ViewMediafile) => boolean = () => false;

    @Output()
    public beforeEditing = new EventEmitter<BeforeEditingEvent>();

    @Output()
    public moved = new EventEmitter<MoveEvent>();

    @Output()
    public selected = new EventEmitter<SelectEvent>();

    @Output()
    public saved = new EventEmitter<SaveEvent>();

    @Output()
    public deleted = new EventEmitter<DeleteEvent>();

    @Output()
    public directoryChanged = new EventEmitter<DirectoryChangeEvent>();

    @ViewChild(`moveDialog`)
    private _moveDialog: TemplateRef<any> | null = null;

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
        /**
         * Shows the mimetype of files,
         * Useful for debugging certain behavior
         */
        /*
        {
             prop: 'mimetype',
             width: '100%',
             minWidth: 60
        },
        */
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

    public get directoryChain(): ViewMediafile[] {
        return this._directoryChain;
    }

    private _directoryChain: ViewMediafile[] = [];

    public readonly filteredDirectoryBehaviorSubject = new BehaviorSubject<ViewMediafile[]>([]);

    public fileEditForm!: FormGroup;
    public moveForm!: FormGroup;

    public directory: ViewMediafile | null = null;

    public selectedRows: ViewMediafile[] = [];

    private readonly directoryBehaviorSubject = new BehaviorSubject<ViewMediafile[]>([]);

    private _sourceFileSubscription: Subscription | null = null;

    public constructor(private dialog: MatDialog, private cd: ChangeDetectorRef, private fb: FormBuilder) {
        this.moveForm = fb.group({ directory_id: [] });
    }

    public ngOnInit(): void {
        if (this.sourceFiles instanceof Observable) {
            this._sourceFileSubscription = this.sourceFiles.subscribe(files =>
                this.directoryBehaviorSubject.next(files)
            );
        } else {
            this.directoryBehaviorSubject.next(this.sourceFiles);
        }
        this.createDataSource();
        this.dataSource.selection.changed.subscribe(selection =>
            this.selected.emit({ files: selection.source.selected })
        );
    }

    public ngOnDestroy(): void {
        if (this._sourceFileSubscription) {
            this._sourceFileSubscription.unsubscribe();
            this._sourceFileSubscription = null;
        }
    }

    public openMoveDialog(files: ViewMediafile[]): void {
        this.move(this._moveDialog!, files);
    }

    public changeDirectory(directoryId: Id | null): void {
        this.directoryChanged.emit({ directoryId });
    }

    public move(templateRef: TemplateRef<any>, files: ViewMediafile[]): void {
        this.moveForm.reset();

        if (files.some(file => file.is_directory)) {
            this.filteredDirectoryBehaviorSubject.next(
                this.directoryBehaviorSubject.value.filter(dir => !files.some(file => dir.url.startsWith(file.url)))
            );
        } else {
            this.filteredDirectoryBehaviorSubject.next(this.directoryBehaviorSubject.value);
        }
        const dialogRef = this.dialog.open(templateRef, infoDialogSettings);

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.moved.emit({ files, directoryId: this.moveForm.value.directory_id });
                this.dataSource.selection.clear();
                this.cd.markForCheck();
            }
        });
    }

    public onEditFile(file: ViewMediafile, template: TemplateRef<any>): void {
        this.beforeEditing.emit({ file });
        this.fileEditForm = this.fb.group({ title: [file.title, Validators.required] });
        const useTemplate = this.editFolderTemplate ?? template;
        this.dialog
            .open(useTemplate, infoDialogSettings)
            .afterClosed()
            .subscribe(result => this.saved.emit({ update: result }));
    }

    public onDelete(file: ViewMediafile): void {
        this.deleted.emit({ file });
    }

    public onSelectRow(event: any /* actually: PblNgridDataMatrixRow<ViewMediafile> */): void {
        if (this.isMultiSelect) {
            const clickedModel: ViewMediafile = event.row;
            const alreadySelected = this.dataSource.selection.isSelected(clickedModel);
            if (alreadySelected) {
                this.dataSource.selection.deselect(clickedModel);
            } else {
                this.dataSource.selection.select(clickedModel);
            }
        }
    }

    public getMediaUrl(file: ViewMediafile): string {
        return `/download/${file.id}`;
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

    private createDataSource(): void {
        this.dataSource = createDS<ViewMediafile>()
            .onTrigger(() => this.directoryBehaviorSubject)
            .create();

        this.dataSource.selection.changed.subscribe(selection => {
            this.selectedRows = selection.source.selected;
        });
    }
}
