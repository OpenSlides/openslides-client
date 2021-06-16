import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { columnFactory, createDS, PblColumnDefinition } from '@pebula/ngrid';
import { PblNgridDataMatrixRow } from '@pebula/ngrid/target-events';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import {
    LOGO_FONT_VALUES,
    MediafileRepositoryService
} from 'app/core/repositories/mediafiles/mediafile-repository.service';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import {
    FontDisplayNames,
    FontPlace,
    LogoDisplayNames,
    LogoPlace,
    MediaManageService
} from 'app/core/ui-services/media-manage.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewportService } from 'app/core/ui-services/viewport.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { Mediafile } from 'app/shared/models/mediafiles/mediafile';
import { infoDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';
import { ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { ViewGroup } from 'app/site/users/models/view-group';
import { MediafilesSortListService } from '../../services/mediafiles-sort-list.service';

/**
 * Lists all the uploaded files.
 */
@Component({
    selector: 'os-mediafile-list',
    templateUrl: './mediafile-list.component.html',
    styleUrls: ['./mediafile-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class MediafileListComponent extends BaseListViewComponent<ViewMediafile> implements OnInit, OnDestroy {
    public logoPlaces: string[];
    public logoDisplayNames = LogoDisplayNames;
    public fontPlaces: string[];
    public fontDisplayNames = FontDisplayNames;

    /**
     * Holds the file to edit
     */
    public fileToEdit: ViewMediafile;

    private dialogRef: MatDialogRef<any>;

    public newDirectoryForm: FormGroup;
    public moveForm: FormGroup;
    public directoryBehaviorSubject: BehaviorSubject<ViewMediafile[]>;
    public filteredDirectoryBehaviorSubject: BehaviorSubject<ViewMediafile[]> = new BehaviorSubject<ViewMediafile[]>(
        []
    );
    public groupsBehaviorSubject: BehaviorSubject<ViewGroup[]>;

    /**
     * @return true if the user can manage media files
     */
    public get canEdit(): boolean {
        return this.operator.hasPerms(Permission.mediafilesCanManage);
    }

    /**
     * Determine if the file menu should generally be accessible, according to the users permission
     */
    public get canAccessFileMenu(): boolean {
        return (
            this.operator.hasPerms(Permission.projectorCanManage) ||
            this.operator.hasPerms(Permission.listOfSpeakersCanSee) ||
            this.operator.hasPerms(Permission.meetingCanManageLogosAndFonts) ||
            this.canEdit
        );
    }

    /**
     * The form to edit Files
     */
    @ViewChild('fileEditForm', { static: true })
    public fileEditForm: FormGroup;

    /**
     * Reference to the template
     */
    @ViewChild('fileEditDialog', { static: true })
    public fileEditDialog: TemplateRef<string>;

    /**
     * Determine generally hidden columns
     */
    public get hiddenColumns(): string[] {
        const hidden = [];
        if (!this.canEdit) {
            hidden.push('info');
        }

        if (!this.isMultiSelect) {
            hidden.push('selection');
        }

        if (!this.canAccessFileMenu) {
            hidden.push('menu');
        }

        return hidden;
    }

    /**
     * Define the column definition
     */
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: 'selection',
            width: '40px'
        },
        {
            prop: 'icon',
            label: '',
            width: '40px'
        },
        {
            prop: 'title',
            width: 'auto',
            minWidth: 60
        },
        {
            prop: 'info',
            width: '20%',
            minWidth: 60
        },
        {
            prop: 'indicator',
            label: '',
            width: '40px'
        },
        {
            prop: 'menu',
            label: '',
            width: '40px'
        }
    ];

    /**
     * Create the column set
     */
    public columnSet = columnFactory()
        .table(...this.tableColumnDefinition)
        .build();

    private folderSubscription: Subscription;
    private directorySubscription: Subscription;
    public directory: ViewMediafile | null;
    public directoryChain: ViewMediafile[];

    private directoryObservable: Observable<ViewMediafile[]> = new Observable();

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private activeMeetingIdService: ActiveMeetingIdService,
        private route: ActivatedRoute,
        private router: Router,
        public repo: MediafileRepositoryService,
        private mediaManage: MediaManageService,
        private promptService: PromptService,
        public vp: ViewportService,
        public sortService: MediafilesSortListService,
        private operator: OperatorService,
        private dialog: MatDialog,
        private formBuilder: FormBuilder,
        private groupRepo: GroupRepositoryService,
        private cd: ChangeDetectorRef,
        private meetingSettingsService: MeetingSettingsService
    ) {
        super(componentServiceCollector);
        this.canMultiSelect = true;

        this.logoPlaces = this.mediaManage.allLogoPlaces;
        this.fontPlaces = this.mediaManage.allFontPlaces;

        this.newDirectoryForm = this.formBuilder.group({
            title: ['', Validators.required],
            access_group_ids: []
        });
        this.moveForm = this.formBuilder.group({
            directory_id: []
        });
        this.directoryBehaviorSubject = this.repo.getDirectoryBehaviorSubject();
        this.groupsBehaviorSubject = this.groupRepo.getViewModelListBehaviorSubject();
    }

    /**
     * Init.
     * Set the title, make the edit Form and observe Mediafiles
     */
    public ngOnInit(): void {
        super.ngOnInit();
        super.setTitle('Files');
        this.createDataSource();

        const directoryId = this.route.snapshot.url.length > 0 ? +this.route.snapshot.url[0].path : null;
        this.changeDirectory(directoryId);
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.clearSubscriptions();
        this.cd.detach();
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingIdService.meetingId],
            follow: [
                {
                    idField: 'mediafile_ids',
                    follow: ['access_group_ids', 'inherited_access_group_ids'],
                    additionalFields: LOGO_FONT_VALUES
                },
                'group_ids'
            ]
        };
    }

    /**
     * Determine if the given file has any extra option to show.
     * @param file the file to check
     * @returns wether the extra menu should be accessible
     */
    public showFileMenu(file: ViewMediafile): boolean {
        return (
            (file.isProjectable() && this.operator.hasPerms(Permission.projectorCanManage)) ||
            (file.isFont() && this.operator.hasPerms(Permission.meetingCanManageLogosAndFonts)) ||
            (file.isImage() && this.operator.hasPerms(Permission.meetingCanManageLogosAndFonts)) ||
            this.canEdit
        );
    }

    public isMediafileUsed(file: ViewMediafile, place: string): boolean {
        const mediafile = this.repo.getViewModel(file.id);
        if (mediafile.isFont()) {
            return mediafile.used_as_font_in_meeting_id(place) === this.activeMeetingId;
        }
        if (mediafile.isImage()) {
            return mediafile.used_as_logo_in_meeting_id(place) === this.activeMeetingId;
        }
        return false;
    }

    public getDateFromTimestamp(timestamp: string): string {
        return new Date(timestamp).toLocaleString(this.translate.currentLang);
    }

    /**
     * TODO: Swap logic to only create DS once and update on filder change
     * @param mediafiles
     */
    private createDataSource(): void {
        this.dataSource = createDS<ViewMediafile>()
            .onTrigger(() => this.directoryObservable)
            .create();

        this.dataSource.selection.changed.subscribe(selection => {
            this.selectedRows = selection.source.selected;
        });
    }

    public changeDirectory(directoryId: number | null): void {
        this.clearSubscriptions();

        this.directoryObservable = this.repo.getListObservableDirectory(directoryId);
        this.folderSubscription = this.directoryObservable.subscribe(mediafiles => {
            if (mediafiles) {
                this.dataSource.refresh();
                this.cd.markForCheck();
            }
        });

        if (directoryId) {
            this.directorySubscription = this.repo.getViewModelObservable(directoryId).subscribe(newDirectory => {
                this.directory = newDirectory;
                if (newDirectory) {
                    this.directoryChain = newDirectory.getDirectoryChain();
                    // Update the URL.
                    this.router.navigate([this.activeMeetingId, 'mediafiles', newDirectory.id]);
                } else {
                    this.directoryChain = [];
                    this.router.navigate([this.activeMeetingId, 'mediafiles']);
                }
            });
        } else {
            this.directory = null;
            this.directoryChain = [];
            this.router.navigate(['mediafiles'], { relativeTo: this.route.parent });
        }
    }

    public onMainEvent(): void {
        this.router.navigate(['/', this.activeMeetingId, 'mediafiles', 'upload', this.directory?.id || '']);
    }

    /**
     * Click on the edit button in the file menu
     *
     * @param file the selected file
     */
    public onEditFile(file: ViewMediafile): void {
        if (!this.isMultiSelect) {
            this.fileToEdit = file;

            this.fileEditForm = this.formBuilder.group({
                title: [file.title, Validators.required],
                access_group_ids: [file.access_group_ids]
            });

            this.dialogRef = this.dialog.open(this.fileEditDialog, infoDialogSettings);
        }
    }

    /**
     * Click on the save button in edit mode
     */
    public async onSaveEditedFile(value: Partial<Mediafile>): Promise<void> {
        await this.repo.update(value, this.fileToEdit);
        this.dialogRef.close();
    }

    /**
     * Sends a delete request to the repository.
     *
     * @param file the file to delete
     */
    public async onDelete(file: ViewMediafile): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete this file?');
        const content = file.getTitle();
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(file);
            if (file.is_directory) {
                this.changeDirectory(file.parent_id);
            }
        }
    }

    public async deleteSelected(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete all selected files and folders?');
        if (await this.promptService.open(title)) {
            await this.repo.bulkDelete(this.selectedRows);
            this.deselectAll();
        }
    }

    /**
     * Returns a formated string for the tooltip containing all the action names.
     *
     * @param file the target file where the tooltip should be shown
     * @returns getNameOfAction with formated strings.
     */
    public formatIndicatorTooltip(file: ViewMediafile): string {
        const settings = this.mediaManage.getPlacesDisplayNames(file);
        const optionNames = settings.map(displayName => this.translate.instant(displayName));
        return optionNames.join('\n');
    }

    public getDisplayNameForPlace(place: FontPlace | LogoPlace): string {
        if (this.logoDisplayNames[place]) {
            return this.logoDisplayNames[place];
        } else {
            return this.fontDisplayNames[place];
        }
    }

    public async toggleMediafileUsage(event: Event, file: ViewMediafile, place: FontPlace | LogoPlace): Promise<void> {
        // prohibits automatic closing
        event.stopPropagation();
        if (file.isFont()) {
            await this.toggleFontUsage(file, place as FontPlace);
        }
        if (file.isImage()) {
            await this.toggleLogoUsage(file, place as LogoPlace);
        }
        this.cd.markForCheck();
    }

    public createNewFolder(templateRef: TemplateRef<string>): void {
        this.newDirectoryForm.reset();
        const dialogRef = this.dialog.open(templateRef, infoDialogSettings);

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const mediafile = {
                    ...this.newDirectoryForm.value,
                    parent_id: this.directory ? this.directory.id : null,
                    is_directory: true
                };
                this.repo.createDirectory(mediafile).catch(this.raiseError);
            }
        });
    }

    public downloadMultiple(mediafiles: ViewMediafile[] = this.dataSource.source): void {
        const eventName = this.meetingSettingsService.instant('name');
        const dirName = this.directory?.filename ?? this.translate.instant('Files');
        const archiveName = `${eventName} - ${dirName}`.trim();
        this.repo.downloadArchive(archiveName, mediafiles);
    }

    public move(templateRef: TemplateRef<string>, mediafiles: ViewMediafile[]): void {
        this.moveForm.reset();

        if (mediafiles.some(file => file.is_directory)) {
            this.filteredDirectoryBehaviorSubject.next(
                this.directoryBehaviorSubject.value.filter(
                    dir => !mediafiles.some(file => dir.url.startsWith(file.url))
                )
            );
        } else {
            this.filteredDirectoryBehaviorSubject.next(this.directoryBehaviorSubject.value);
        }
        const dialogRef = this.dialog.open(templateRef, infoDialogSettings);

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.repo.move(mediafiles, this.moveForm.value.directory_id).then(() => {
                    this.dataSource.selection.clear();
                    this.cd.markForCheck();
                }, this.raiseError);
            }
        });
    }

    public getMediaUrl(mediaFile: Mediafile): string {
        return `/download/${mediaFile.id}`;
    }

    /**
     * TODO: This is basically a duplicate of onSelectRow of ListViewTableComponent
     */
    public onSelectRow(event: PblNgridDataMatrixRow<ViewMediafile>): void {
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

    private async toggleLogoUsage(file: ViewMediafile, place: LogoPlace): Promise<void> {
        if (this.isMediafileUsed(file, place)) {
            await this.mediaManage.unsetLogo(place);
        } else {
            await this.mediaManage.setLogo(place, file);
        }
    }

    private async toggleFontUsage(file: ViewMediafile, place: FontPlace): Promise<void> {
        if (this.isMediafileUsed(file, place)) {
            await this.mediaManage.unsetFont(place);
        } else {
            await this.mediaManage.setFont(place, file);
        }
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
