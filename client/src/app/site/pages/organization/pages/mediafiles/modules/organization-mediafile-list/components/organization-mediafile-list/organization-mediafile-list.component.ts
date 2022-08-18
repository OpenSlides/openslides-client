import { ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { Mediafile } from 'src/app/domain/models/mediafiles/mediafile';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { MediafileListExportService } from 'src/app/site/pages/meetings/pages/mediafiles/modules/mediafile-list/services/mediafile-list-export.service/mediafile-list-export.service';
import { MediafileListSortService } from 'src/app/site/pages/meetings/pages/mediafiles/modules/mediafile-list/services/mediafile-list-sort.service';
import { MediafileControllerService } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-controller.service';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { FileListComponent } from 'src/app/ui/modules/file-list/components/file-list/file-list.component';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

@Component({
  selector: `os-organization-mediafile-list`,
  templateUrl: `./organization-mediafile-list.component.html`,
  styleUrls: [`./organization-mediafile-list.component.scss`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationMediafileListComponent extends BaseListViewComponent<ViewMediafile> {
    @ViewChild(FileListComponent)
    public readonly fileListComponent!: FileListComponent;

    /**
     * Holds the file to edit
     */
    public fileToEdit!: ViewMediafile;

    public newDirectoryForm: UntypedFormGroup;

    /**
     * @return true if the user can manage media files
     */
    public get canEdit(): boolean {
        return this.operator.hasOrganizationPermissions(OML.can_manage_organization);
    }

    public get shouldShowFileMenuFn(): (file: ViewMediafile) => boolean {
        return file => this.showFileMenu(file);
    }

    /**
     * Determine if the file menu should generally be accessible, according to the users permission
     */
    public get canAccessFileMenu(): boolean {
        return this.canEdit;
    }

    /**
     * The form to edit Files
     */
    public fileEditForm: UntypedFormGroup | null = null;

    private folderSubscription: Subscription | null = null;
    private directorySubscription: Subscription | null = null;
    public directory: ViewMediafile | null = null;
    public directoryChain: ViewMediafile[] = [];

    public directoryObservable: Observable<ViewMediafile[]>;
    private directorySubject: BehaviorSubject<ViewMediafile[]> = new BehaviorSubject([]);

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        private route: ActivatedRoute,
        public repo: MediafileControllerService,
        private exporter: MediafileListExportService,
        // private mediaManage: MediaManageService,
        private promptService: PromptService,
        public vp: ViewPortService,
        public sortService: MediafileListSortService,
        private operator: OperatorService,
        private dialog: MatDialog,
        private formBuilder: UntypedFormBuilder,
        private cd: ChangeDetectorRef
    ) {
        super(componentServiceCollector, translate);
        this.canMultiSelect = true;

        this.newDirectoryForm = this.formBuilder.group({
            title: [``, Validators.required]
        });
        this.directoryObservable = this.directorySubject.asObservable();
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
        return this.canEdit;
    }

    public changeDirectory(directoryId: number | null): void {
        this.clearSubscriptions();

        // pipe the directory observable to the directorySubject so that the actual observable which
        // is given to the file list does not change
        this.folderSubscription = this.repo.getDirectoryObservable(directoryId).subscribe(this.directorySubject);

        if (directoryId) {
            this.directorySubscription = this.repo.getViewModelObservable(directoryId).subscribe(newDirectory => {
                this.directory = newDirectory;
                if (newDirectory) {
                    this.directoryChain = newDirectory.getDirectoryChain();
                    // Update the URL.
                    this.router.navigate([`mediafiles`, newDirectory.id]);
                } else {
                    this.directoryChain = [];
                    this.router.navigate([`mediafiles`]);
                }
            });
        } else {
            this.directory = null;
            this.directoryChain = [];
            this.router.navigate([`/mediafiles`]);
        }
    }

    public onMainEvent(): void {
        const navigationCommands: any[] = [`/`, `mediafiles`, `upload`];
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
                title: [file.title, Validators.required]
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

    public downloadMultiple(mediafiles: ViewMediafile[] = this.directorySubject.value): void {
        const dirName = this.directory?.title ?? this.translate.instant(`Files`);
        const archiveName = `${dirName}`.trim();
        this.exporter.downloadArchive(archiveName, mediafiles);
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
