import { CommonModule } from '@angular/common';
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
    ViewChild
} from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { _ } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Mediafile } from 'src/app/domain/models/mediafiles/mediafile';
import { getIntlCollatorForLang } from 'src/app/infrastructure/utils';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ViewMediafile, ViewMeetingMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { MediafileControllerService } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-controller.service';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';
import { ListComponent } from 'src/app/ui/modules/list/components';

import { PipesModule } from '../../pipes';
import { CommaSeparatedListingComponent } from '../comma-separated-listing';
import { IconContainerComponent } from '../icon-container';
import { ListModule } from '../list';
import { PromptService } from '../prompt-dialog';
import { END_POSITION, START_POSITION } from '../scrolling-table/directives/scrolling-table-cell-position';
import { SearchSelectorModule } from '../search-selector';

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatButtonModule,
        MatDialogModule,
        ListModule,
        SearchSelectorModule,
        IconContainerComponent,
        PipesModule,
        OpenSlidesTranslationModule,
        CommaSeparatedListingComponent
    ]
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

    @Input()
    public isOrgaLevelAndRootLevel = false;

    private _hiddenInMobile: string[] = [`indicator`];

    public get hiddenInMobile(): string[] {
        return this._hiddenInMobile;
    }

    @Input()
    public set hiddenInMobile(cols: string[]) {
        this._hiddenInMobile = [`indicator`, ...cols];
    }

    @Input()
    public isInMeeting = true;

    @Input()
    public addBottomSpacer = false;

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

    @Input()
    public isUsedAsFontFn: (file: ViewMediafile) => boolean = (file: ViewMediafile) =>
        !!file.getMeetingMediafile()?.used_as_font_in_meeting_id();

    @Input()
    public isUsedAsLogoFn: (file: ViewMediafile) => boolean = (file: ViewMediafile) =>
        !!file.getMeetingMediafile()?.used_as_logo_in_meeting_id();

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
        return this._directoryBehaviorSubject;
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

    public movingToPublicFolder = false;
    public movingFromPublicFolder = false;

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
        private repo: MediafileControllerService,
        private activeMeeting: ActiveMeetingService,
        private promptService: PromptService
    ) {
        super();
        this.moveForm = fb.group({ directory_id: [] });
        this.subscriptions.push(
            this.moveForm.get(`directory_id`).valueChanges.subscribe(id => {
                this.movingToPublicFolder = id && this.repo.getViewModel(id).isPublishedOrganizationWide;
            })
        );
    }

    public ngOnInit(): void {
        this._languageCollator = new Intl.Collator(this.translate.getCurrentLang());
        this.translate.onLangChange.subscribe(changeEvent => {
            this._languageCollator = getIntlCollatorForLang(changeEvent.lang);
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

    public onSelectedRowsChange(files: ViewMediafile[]): void {
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

        this.filteredDirectoryBehaviorSubject.next(
            this.repo.getViewModelList().filter(dir => dir.canMoveFilesTo(files))
        );
        this.movingFromPublicFolder = files.some(f => f.parent?.isPublishedOrganizationWide);

        const dialogRef = this.dialog.open(templateRef, infoDialogSettings);

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.repo.move(files, this.moveForm.value.directory_id || null);
                this.moved.emit({ files, directoryId: this.moveForm.value.directory_id });
                this.cd.markForCheck();
            }
        });
    }

    public async togglePublish(file: ViewMediafile): Promise<void> {
        const publishing = !file.isPublishedOrganizationWide;
        let title: string = _(`Are you sure you want to make this file/folder public?`);
        let content = this.translate.instant(`Every admin in every meeting will be able to see this content.`);
        let confirm: string = _(`Publish`);
        if (!publishing) {
            title = _(`Are you sure you want to unpublish this file/folder?`);
            content = ``;
            if (file.meeting_mediafiles?.length) {
                content = this.translate.instant(`File is used in:`);
                content = content + `<br>` + file.meeting_mediafiles.map(mm => mm.meeting?.name).join(`, `);
            }
            confirm = _(`Unpublish`);
        }

        if (await this.promptService.open(title, content, confirm)) {
            this.repo.publish(file, publishing);
        }
    }

    public onEditFile(file: ViewMediafile, template: TemplateRef<any>): void {
        const mediafile: ViewMediafile | ViewMeetingMediafile = file;
        this.beforeEditing.emit({ file });
        this.fileEditForm = this.fb.group({ title: [mediafile.title, Validators.required] });
        const useTemplate = this.editFolderTemplate ?? template;
        this.dialog
            .open(useTemplate, infoDialogSettings)
            .afterClosed()
            .subscribe(result => this.saved.emit({ update: result }));
    }

    public onDelete(file: ViewMediafile): void {
        this.deleted.emit({ file });
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
        const defaultSortFn = (fileA: ViewMediafile, fileB: ViewMediafile): number => {
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

    public ariaLabel(mediafile: ViewMediafile): string {
        if (mediafile.is_directory) {
            return this.translate.instant(`Navigate to the folder`) + ` '` + mediafile + `'`;
        }
        return this.translate.instant(`Download the file`) + ` '` + mediafile + `'`;
    }

    protected getGroups(mediafile: ViewMediafile): ViewGroup[] {
        const meeting_mediafile = mediafile?.getMeetingMediafile();
        if (meeting_mediafile) {
            return meeting_mediafile.inherited_access_groups;
        } else if (mediafile.parent_id) {
            return this.getGroups(mediafile.parent);
        } else if (mediafile.access_groups) {
            return mediafile.access_groups;
        } else if (mediafile.isPublishedOrganizationWide) {
            return [this.activeMeeting.meeting.admin_group];
        }

        return [] as ViewGroup[];
    }

    protected fileCanBeModified(mediafile: ViewMediafile): boolean {
        return !(this.isInMeeting && mediafile.isPublishedOrganizationWide);
    }

    protected fileCanBeMoved(mediafile: ViewMediafile): boolean {
        return !(this.isOrgaLevelAndRootLevel && mediafile.isPublishedOrganizationWide);
    }
}
