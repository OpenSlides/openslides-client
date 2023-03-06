import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { Mediafile } from 'src/app/domain/models/mediafiles/mediafile';
import { LogoDisplayNames, LogoPlace } from 'src/app/domain/models/mediafiles/mediafile.constants';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { MediafileListExportService } from 'src/app/site/pages/meetings/pages/mediafiles/modules/mediafile-list/services/mediafile-list-export.service/mediafile-list-export.service';
import { MediafileListSortService } from 'src/app/site/pages/meetings/pages/mediafiles/modules/mediafile-list/services/mediafile-list-sort.service';
import { MediafileCommonService } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-common.service';
import { MediafileControllerService } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-controller.service';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { FileListComponent } from 'src/app/ui/modules/file-list/components/file-list/file-list.component';

@Component({
    selector: `os-organization-mediafile-list`,
    templateUrl: `./organization-mediafile-list.component.html`,
    styleUrls: [`./organization-mediafile-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationMediafileListComponent
    extends BaseListViewComponent<ViewMediafile>
    implements OnInit, OnDestroy
{
    @ViewChild(FileListComponent)
    public readonly fileListComponent!: FileListComponent;

    /**
     * Holds the file to edit
     */
    public fileToEdit!: ViewMediafile;

    public newDirectoryForm: UntypedFormGroup;

    public logoPlaces: LogoPlace[] = [`web_header`];
    public logoDisplayNames = LogoDisplayNames;

    public updatingLogoAndFontSettings = false;

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

    public isUsedAsLogoFn = (file: ViewMediafile) => this.isUsedAs(file);
    public isUsedAsFontFn = (file: ViewMediafile) => false;

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
        public vp: ViewPortService,
        public sortService: MediafileListSortService,
        private operator: OperatorService,
        private formBuilder: UntypedFormBuilder,
        private cd: ChangeDetectorRef,
        private commonService: MediafileCommonService
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

    public isMediafileUsed(file: ViewMediafile, place: LogoPlace): boolean {
        const mediafile = this.repo.getViewModel(file.id)!;
        if (file.isImage() && !Object.keys(LogoDisplayNames).includes(place)) {
            return false;
        }
        return mediafile.token === place;
    }

    public async toggleMediafileUsage(event: Event, mediafile: ViewMediafile, place: LogoPlace): Promise<void> {
        // prohibits automatic closing
        event.stopPropagation();
        this.updatingLogoAndFontSettings = true;
        const file = this.repo.getViewModel(mediafile.id);
        if (!file || (file.isImage() && !Object.keys(LogoDisplayNames).includes(place))) {
            throw new Error(!file ? `File has been deleted` : `Invalid mediafile type for place.`);
        }
        const fullPlace = place;
        if (file.token !== fullPlace) {
            for (let filteredFile of this.repo
                .getViewModelList()
                .filter(filterFile => filterFile.token === fullPlace && filterFile.id !== file.id)) {
                await this.repo.update({ token: null }, filteredFile);
            }
            await this.repo.update({ token: fullPlace }, file);
        } else {
            await this.repo.update({ token: null }, file);
        }
        this.updatingLogoAndFontSettings = false;
        this.cd.markForCheck();
    }

    public getDisplayNameForPlace(place: LogoPlace): string {
        const prefix = `Global`;
        return `${prefix} ${LogoDisplayNames[place].toLowerCase()}`;
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
                this.commonService.navigateToDirectoryPage(this.directory, directoryChain => {
                    this.directoryChain = directoryChain;
                });
            });
        } else {
            this.directory = null;
            this.commonService.navigateToDirectoryPage(
                this.directory,
                directoryChain => {
                    this.directoryChain = directoryChain;
                },
                true
            );
        }
    }

    public onMainEvent(): void {
        this.commonService.navigateToUploadPage(this.directory?.id);
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
        await this.commonService.handleDeleteFile(file, id => this.changeDirectory(id));
    }

    public async deleteSelected(): Promise<void> {
        await this.commonService.handleDeleteSelected(this.selectedRows, () => this.deselectAll());
    }

    public createNewFolder(templateRef: TemplateRef<string>): void {
        this.commonService
            .handleCreateNewFolder(this.newDirectoryForm, this.directory, templateRef)
            .catch(this.raiseError);
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

    private isUsedAs(file: ViewMediafile): boolean {
        const places = this.logoPlaces;
        return places.some(place => this.isMediafileUsed(file, place));
    }
}
