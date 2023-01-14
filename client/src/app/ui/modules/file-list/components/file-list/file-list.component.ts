import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Mediafile } from 'src/app/domain/models/mediafiles/mediafile';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { MediafileControllerService } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-controller.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';
import { ListComponent } from 'src/app/ui/modules/list/components';

import { END_POSITION, START_POSITION } from '../../../scrolling-table/directives/scrolling-table-cell-position';

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

const SUBSCRIPTION_NAME = `file_list_subscription`;

@Component({
    selector: `os-file-list`,
    templateUrl: `./file-list.component.html`,
    styleUrls: [`./file-list.component.scss`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileListComponent extends BaseUiComponent implements OnInit, OnDestroy {
    public readonly END_POSITION = END_POSITION;
    public readonly START_POSITION = START_POSITION;

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

    private _hiddenInMobile: string[] = [`indicator`];

    public get hiddenInMobile(): string[] {
        return this._hiddenInMobile;
    }

    @Input()
    public set hiddenInMobile(cols: string[]) {
        this._hiddenInMobile = [`indicator`, ...cols];
    }

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
    public sortFn: (fileA: ViewMediafile, fileB: ViewMediafile) => number;

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

    @ViewChild(ListComponent)
    private _listComponent: ListComponent<ViewMediafile> | undefined;

    public get directoryObservable(): Observable<ViewMediafile[]> {
        return this._directoryBehaviorSubject.asObservable();
    }

    /**
     * The height of the file list. The viewport height is decreased by `130px`. This is almost the summary of the
     * height of the global and the local headbar and the custom table header.
     */
    public readonly fileListHeight = `calc(100vh - 130px)`;
    public readonly filteredDirectoryBehaviorSubject = new BehaviorSubject<ViewMediafile[]>([]);

    public get directoryChain(): ViewMediafile[] {
        return this._directoryChain;
    }

    public fileEditForm!: UntypedFormGroup;
    public moveForm!: UntypedFormGroup;

    public directory: ViewMediafile | null = null;

    public selectedRows: ViewMediafile[] = [];

    private get currentFileList(): ViewMediafile[] {
        return this._directoryBehaviorSubject.value;
    }

    private _languageCollator: Intl.Collator;
    private _directoryChain: ViewMediafile[] = [];

    private readonly _directoryBehaviorSubject = new BehaviorSubject<ViewMediafile[]>([]);

    public constructor(
        private dialog: MatDialog,
        private cd: ChangeDetectorRef,
        private fb: UntypedFormBuilder,
        private translate: TranslateService,
        private repo: MediafileControllerService
    ) {
        super();
        this.moveForm = fb.group({ directory_id: [] });
    }

    public ngOnInit(): void {
        this._languageCollator = new Intl.Collator(this.translate.currentLang);
        this.translate.onLangChange.subscribe(changeEvent => {
            this._languageCollator = new Intl.Collator(changeEvent.lang);
            this.updateView();
        });
        if (this.sourceFiles instanceof Observable) {
            this.updateSubscription(
                SUBSCRIPTION_NAME,
                this.sourceFiles.subscribe(files => this.updateView(files))
            );
        } else {
            this.updateView(this.sourceFiles);
        }
    }

    public onSelectedRowsChange(files: ViewMediafile[]) {
        this.selected.emit({ files });
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
                this.repo
                    .getViewModelList()
                    .filter(dir => dir.is_directory && !files.some(file => dir.url.startsWith(file.url)))
            );
        } else {
            this.filteredDirectoryBehaviorSubject.next(this.repo.getViewModelList().filter(dir => dir.is_directory));
        }
        const dialogRef = this.dialog.open(templateRef, infoDialogSettings);

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.repo.move(files, this.moveForm.value.directory_id || null);
                this.moved.emit({ files, directoryId: this.moveForm.value.directory_id });
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

    public getMediaUrl(file: ViewMediafile): (number | string)[] {
        return [`/system`, `media`, `get`, file.id];
    }

    /**
     * Select all files in the current data source
     */
    public selectAll(): void {
        if (this._listComponent) {
            this._listComponent.selectAll();
        }
    }

    /**
     * Handler to quickly unselect all items.
     */
    public deselectAll(): void {
        if (this._listComponent) {
            this._listComponent.deselectAll();
        }
    }

    private updateView(nextFiles: ViewMediafile[] = this.currentFileList): void {
        const defaultSortFn = (fileA: ViewMediafile, fileB: ViewMediafile) => {
            if (fileA.is_directory && !fileB.is_directory) {
                return -1;
            }
            if (!fileA.is_directory && fileB.is_directory) {
                return 1;
            }
            return this._languageCollator.compare(fileA.getTitle(), fileB.getTitle());
        };
        const nextFileList = nextFiles.slice().sort((a, b) => this.sortFn?.(a, b) || defaultSortFn(a, b));
        this._directoryBehaviorSubject.next(nextFileList);
    }
}
