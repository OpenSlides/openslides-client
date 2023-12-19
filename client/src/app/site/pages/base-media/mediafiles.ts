import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Mediafile } from 'src/app/domain/models/mediafiles/mediafile';
import { FontPlace, LogoDisplayNames, LogoPlace } from 'src/app/domain/models/mediafiles/mediafile.constants';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { MediafileListExportService } from 'src/app/site/pages/meetings/pages/mediafiles/modules/mediafile-list/services/mediafile-list-export.service/mediafile-list-export.service';
import { MediafileCommonService } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-common.service';
import { MediafileControllerService } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-controller.service';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { OML } from 'src/app/domain/definitions/organization-permission';

import { FileListComponent } from '../../../ui/modules/file-list/components/file-list/file-list.component';
import { ModelData } from '../../services/autoupdate/utils';
import { MEDIAFILES_SUBSCRIPTION } from '../meetings/pages/mediafiles/mediafiles.subscription';
import { ActiveMeetingIdService } from '../meetings/services/active-meeting-id.service';
import { MeetingComponentServiceCollectorService } from '../meetings/services/meeting-component-service-collector.service';
import { MeetingSettingsService } from '../meetings/services/meeting-settings.service';
import { ORGANIZATION_SUBSCRIPTION } from '../organization/organization.subscription';
import { ORGANIZATION_MEDIAFILE_LIST_SUBSCRIPTION } from '../organization/pages/mediafiles/mediafiles.subscription';
import { Permission } from 'src/app/domain/definitions/permission';

@Component({ templateUrl: `./mediafiles.html` })
export abstract class MediafileListeComponent extends BaseListViewComponent<ViewMediafile> implements OnInit, OnDestroy {
    @ViewChild(FileListComponent)
    public readonly fileListComponent!: FileListComponent;

    public get activeMeetingId(): Id | null {
        return this.activeMeetingIdService.meetingId;
    }

    protected get activeMeetingIdService(): ActiveMeetingIdService {
        return this.componentServiceCollector.activeMeetingIdService;
    }

    protected get meetingSettingsService(): MeetingSettingsService {
        return this.componentServiceCollector.meetingSettingsService;
    }

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

    //public isUsedAsLogoFn = (file: ViewMediafile) => this.isUsedAs(file, true);
    public isUsedAsLogoFn = (file: ViewMediafile) => false;
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
    public override componentServiceCollector = inject(MeetingComponentServiceCollectorService);

    /**
     * @return true if the user can manage media files
     */
    public get canEdit(): boolean {
        return this.operator.hasOrganizationPermissions(OML.can_manage_organization) || this.operator.hasPerms(Permission.mediafileCanManage);
    }

    public get shouldShowFileMenuFn(): (file?: ViewMediafile) => boolean {
        return (file?) => file? this.showFileMenu(file): this.showFileMenu();
    }

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

        const directoryId = +this.route.snapshot.params?.[`id`] || null;
        this.changeDirectory(directoryId);
    }

    public async changeDirectory(directoryId: number | null, isOrgaLevel = true): Promise<void> {
        let mediafilesSubscribed: boolean | ModelData;
        if (isOrgaLevel) {
            mediafilesSubscribed = (
                await Promise.all([
                    this.modelRequestService.subscriptionGotData(ORGANIZATION_SUBSCRIPTION),
                    this.modelRequestService.subscriptionGotData(ORGANIZATION_MEDIAFILE_LIST_SUBSCRIPTION)
                ])
            ).some(val => !!val);
        } else {
            mediafilesSubscribed = await this.modelRequestService.subscriptionGotData(MEDIAFILES_SUBSCRIPTION);
        }

        if (!mediafilesSubscribed) {
            setTimeout(() => this.changeDirectory(directoryId), 50);
            return;
        }

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
    public onEditFile(file: ViewMediafile, isOrgaLevel: boolean): void {
        if (!this.isMultiSelect) {
            this.fileToEdit = file;

            if (isOrgaLevel) {
                this.fileEditForm = this.formBuilder.group({
                    title: [file.title, Validators.required]
                });
            } else {
                this.fileEditForm = this.formBuilder.group({
                    title: [file.title, Validators.required],
                    access_group_ids: [file.access_group_ids]
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

    private isUsedAs(file: ViewMediafile, isOrgaLevel: boolean): boolean {
        const places = this.logoPlaces;
        return places.some(place => this.isMediafileUsed(file, place, isOrgaLevel));
    }
    
    public isMediafileUsed(file: ViewMediafile, place: LogoPlace | string, isOrgaLevel: boolean): boolean {
        const mediafile = this.repo.getViewModel(file.id)!;
        if (isOrgaLevel) {
            if (file.isImage() && !Object.keys(LogoDisplayNames).includes(place)) {
                return false;
            }
            return mediafile.token === place;
        } else {
            if (mediafile.isFont()) {
                return mediafile.used_as_font_in_meeting_id(place as FontPlace) === this.activeMeetingId;
            }
            if (mediafile.isImage()) {
                return mediafile.used_as_logo_in_meeting_id(place as LogoPlace) === this.activeMeetingId;
            }
            return false;
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

    public downloadMultiple(isOrgaLevel: boolean, mediafiles: ViewMediafile[] = this.directorySubject.value): void {
        let eventName = ``;
        if(!isOrgaLevel) {
            eventName = this.meetingSettingsService.instant(`name`);
        } 
        const dirName = this.directory?.title ?? this.translate.instant(`Files`);
        const archiveName = `${eventName} - ${dirName}`.trim();
        this.exporter.downloadArchive(archiveName, mediafiles);
    }

    /**
     * Determine if the given file has any extra option to show.
     * @param file the file to check
     * @returns wether the extra menu should be accessible
     */
    public showFileMenu(file?: ViewMediafile): boolean {
        return (
            (file?.isProjectable() && this.operator.hasPerms(Permission.projectorCanManage)) ||
            (file?.isFont() && this.operator.hasPerms(Permission.meetingCanManageLogosAndFonts)) ||
            (file?.isImage() && this.operator.hasPerms(Permission.meetingCanManageLogosAndFonts)) ||
            this.canEdit
        );
    }
}
