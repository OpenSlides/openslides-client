import { ChangeDetectorRef, Directive, inject, Injectable, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { LogoDisplayNames, LogoPlace } from 'src/app/domain/models/mediafiles/mediafile.constants';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { MediafileListExportService } from 'src/app/site/pages/meetings/pages/mediafiles/modules/mediafile-list/services/mediafile-list-export.service/mediafile-list-export.service';
import { MediafileCommonService } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-common.service';
import { MediafileControllerService } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-controller.service';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { FileListComponent } from '../../../ui/modules/file-list/components/file-list/file-list.component';
import { OperatorService } from 'src/app/site/services/operator.service';
import { Mediafile } from 'src/app/domain/models/mediafiles/mediafile';

@Injectable({
    providedIn: `root`
})

export abstract class BaseMediafileComponent extends BaseListViewComponent<ViewMediafile> implements OnInit, OnDestroy {
    @ViewChild(FileListComponent)
    public readonly fileListComponent!: FileListComponent;

    /**
     * Holds the file to edit
     */
    public fileToEdit!: ViewMediafile;

    public newDirectoryForm: UntypedFormGroup;

    public logoPlaces: LogoPlace[];
    public logoDisplayNames = LogoDisplayNames;

    /**
     * The form to edit Files
     */
    public fileEditForm: UntypedFormGroup | null = null;

    //public isUsedAsLogoFn = (file: ViewMediafile) => false;
    public isUsedAsFontFn = (_file: ViewMediafile) => false;

    public folderSubscription: Subscription | null = null;
    public directorySubscription: Subscription | null = null;
    public directory: ViewMediafile | null = null;
    public directoryChain: ViewMediafile[] = [];

    public directoryObservable: Observable<ViewMediafile[]>;
    public directorySubject: BehaviorSubject<ViewMediafile[]> = new BehaviorSubject([]);

    public route = inject(ActivatedRoute);
    public repo = inject(MediafileControllerService);
    public exporter = inject(MediafileListExportService);
    public vp = inject(ViewPortService);
    public operator = inject(OperatorService);
    public formBuilder = inject(UntypedFormBuilder);
    public cd = inject(ChangeDetectorRef);
    public commonService = inject(MediafileCommonService);

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService
    ) {
        super(componentServiceCollector, translate);
        this.canMultiSelect = true;

        this.newDirectoryForm = this.formBuilder.group({
            title: [``, Validators.required]
        });
        this.directoryObservable = this.directorySubject as Observable<ViewMediafile[]>;
    }

    /**
     * Init.
     * Set the title, make the edit Form and observe Mediafiles
     */
    public ngOnInit(): void {
        super.setTitle(`Files`);

        //const directoryId = +this.route.snapshot.params?.[`id`] || null;
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
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

    public onMainEvent(): void {
        this.commonService.navigateToUploadPage(this.directory?.id);
    }

    /**
     * Click on the edit button in the file menu
     *
     * @param file the selected file
     */
    public onEditFile(file: ViewMediafile, hasAccessGroups = false): void {
        if (!this.isMultiSelect) {
            this.fileToEdit = file;

            if(hasAccessGroups) {
                this.fileEditForm = this.formBuilder.group({
                    title: [file.title, Validators.required],
                    access_group_ids: [file.access_group_ids]
                });
            } else {
                this.fileEditForm = this.formBuilder.group({
                    title: [file.title, Validators.required]
            });

            }
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

    public async deleteSelected(): Promise<void> {
        await this.commonService.handleDeleteSelected(this.selectedRows, () => this.deselectAll());
    }

    public createNewFolder(templateRef: TemplateRef<string>): void {
        this.commonService
            .handleCreateNewFolder(this.newDirectoryForm, this.directory, templateRef)
            .catch(this.raiseError);
    }

    public clearSubscriptions(): void {
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
