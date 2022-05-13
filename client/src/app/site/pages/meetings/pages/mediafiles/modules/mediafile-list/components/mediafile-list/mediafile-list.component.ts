import { Component, OnInit, TemplateRef, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { Mediafile } from 'src/app/domain/models/mediafiles/mediafile';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { PblColumnDefinition } from '@pebula/ngrid';
import { Permission } from 'src/app/domain/definitions/permission';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { MatDialog } from '@angular/material/dialog';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';
import { MediaManageService } from 'src/app/site/pages/meetings/services/media-manage.service';
import { MediafileControllerService } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-controller.service';
import { TranslateService } from '@ngx-translate/core';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { Observable, Subscription } from 'rxjs';
import { ViewGroup } from '../../../../../participants/modules/groups/view-models/view-group';
import { MediafileListSortService } from '../../services/mediafile-list-sort.service';
import { MediafileListGroupService } from '../../services/mediafile-list-group.service';
import {
    FontDisplayNames,
    FontPlace,
    LogoDisplayNames,
    LogoPlace
} from 'src/app/domain/models/mediafiles/mediafile.constants';
import { FileListComponent } from 'src/app/ui/modules/file-list/components/file-list/file-list.component';
import { MediafileListExportService } from '../../services/mediafile-list-export.service/mediafile-list-export.service';

@Component({
    selector: 'os-mediafile-list',
    templateUrl: './mediafile-list.component.html',
    styleUrls: ['./mediafile-list.component.scss']
})
export class MediafileListComponent extends BaseMeetingListViewComponent<ViewMediafile> implements OnInit, OnDestroy {
    @ViewChild(FileListComponent)
    public readonly fileListComponent!: FileListComponent;

    public logoPlaces: string[];
    public logoDisplayNames = LogoDisplayNames;
    public fontPlaces: string[];
    public fontDisplayNames = FontDisplayNames;

    /**
     * Holds the file to edit
     */
    public fileToEdit!: ViewMediafile;

    public newDirectoryForm: FormGroup;
    public groupsBehaviorSubject: Observable<ViewGroup[]>;

    /**
     * @return true if the user can manage media files
     */
    public get canEdit(): boolean {
        return this.operator.hasPerms(Permission.mediafileCanManage);
    }

    public get shouldShowFileMenuFn(): (file: ViewMediafile) => boolean {
        return file => this.showFileMenu(file);
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
    public fileEditForm: FormGroup | null = null;

    /**
     * Just to fulfill base class'es interface
     */
    public tableColumnDefinition: PblColumnDefinition[] = [];

    private folderSubscription: Subscription | null = null;
    private directorySubscription: Subscription | null = null;
    public directory: ViewMediafile | null = null;
    public directoryChain: ViewMediafile[] = [];

    public directoryObservable: Observable<ViewMediafile[]> = new Observable();

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private route: ActivatedRoute,
        public repo: MediafileControllerService,
        private exporter: MediafileListExportService,
        private mediaManage: MediaManageService,
        private promptService: PromptService,
        public vp: ViewPortService,
        public sortService: MediafileListSortService,
        private operator: OperatorService,
        private dialog: MatDialog,
        private formBuilder: FormBuilder,
        private groupRepo: MediafileListGroupService,
        private cd: ChangeDetectorRef
    ) {
        super(componentServiceCollector, translate);
        this.canMultiSelect = true;

        this.logoPlaces = this.mediaManage.allLogoPlaces;
        this.fontPlaces = this.mediaManage.allFontPlaces;

        this.newDirectoryForm = this.formBuilder.group({
            title: [``, Validators.required],
            access_group_ids: []
        });
        this.groupsBehaviorSubject = this.groupRepo.getViewModelListObservable();
    }

    /**
     * Init.
     * Set the title, make the edit Form and observe Mediafiles
     */
    public ngOnInit(): void {
        super.setTitle(`Files`);

        const directoryId = +this.route.snapshot.params?.[`id`] || null;
        this.changeDirectory(directoryId);
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.clearSubscriptions();
        this.cd.detach();
    }

    public override selectAll(): void {
        this.fileListComponent.selectAll();
    }

    public override deselectAll(): void {
        this.fileListComponent.deselectAll();
    }

    public onSelect(files: ViewMediafile[]): void {
        this.selectedRows = files;
    }

    public onMove(files: ViewMediafile[]): void {
        this.fileListComponent.openMoveDialog(files);
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
        const mediafile = this.repo.getViewModel(file.id)!;
        if (mediafile.isFont()) {
            return mediafile.used_as_font_in_meeting_id(place) === this.activeMeetingId;
        }
        if (mediafile.isImage()) {
            return mediafile.used_as_logo_in_meeting_id(place) === this.activeMeetingId;
        }
        return false;
    }

    public changeDirectory(directoryId: number | null): void {
        this.clearSubscriptions();

        this.directoryObservable = this.repo.getDirectoryObservable(directoryId);
        this.folderSubscription = this.directoryObservable.subscribe(mediafiles => {
            if (mediafiles && this.dataSource) {
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
                    this.router.navigate([this.activeMeetingId, `mediafiles`, newDirectory.id]);
                } else {
                    this.directoryChain = [];
                    this.router.navigate([this.activeMeetingId, `mediafiles`]);
                }
            });
        } else {
            this.directory = null;
            this.directoryChain = [];
            this.router.navigate([`/${this.activeMeetingId}`, `mediafiles`]);
        }
    }

    public onMainEvent(): void {
        const navigationCommands = [`/`, this.activeMeetingId, `mediafiles`, `upload`];
        if (this.directory) {
            navigationCommands.push(this.directory.id);
        }
        this.router.navigate(navigationCommands);
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
        }
    }

    /**
     * Click on the save button in edit mode
     */
    public async onSaveFile(value: Partial<Mediafile> | null): Promise<void> {
        if (value) {
            await this.repo.update(value, this.fileToEdit);
        }
    }

    /**
     * Sends a delete request to the repository.
     *
     * @param file the file to delete
     */
    public async onDeleteFile(file: ViewMediafile): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this file?`);
        const content = file.getTitle();
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(file);
            if (file.is_directory) {
                this.changeDirectory(file.parent_id);
            }
        }
    }

    public async deleteSelected(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete all selected files and folders?`);
        if (await this.promptService.open(title)) {
            await this.repo.delete(...this.selectedRows);
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
        return optionNames.join(`\n`);
    }

    public getDisplayNameForPlace(place: FontPlace | LogoPlace): string {
        if (this.logoDisplayNames[place as LogoPlace]) {
            return this.logoDisplayNames[place as LogoPlace];
        } else {
            return this.fontDisplayNames[place as FontPlace];
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

        dialogRef.afterClosed().subscribe((result: any) => {
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

    public downloadMultiple(mediafiles: ViewMediafile[] = this.dataSource!.source): void {
        const eventName = this.meetingSettingsService.instant(`name`);
        const dirName = this.directory?.title ?? this.translate.instant(`Files`);
        const archiveName = `${eventName} - ${dirName}`.trim();
        this.exporter.downloadArchive(archiveName, mediafiles);
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
