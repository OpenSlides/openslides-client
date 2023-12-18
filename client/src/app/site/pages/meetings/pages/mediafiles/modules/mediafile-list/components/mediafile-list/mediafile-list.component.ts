import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { Mediafile } from 'src/app/domain/models/mediafiles/mediafile';
import {
    FontDisplayNames,
    FontPlace,
    LogoDisplayNames,
    LogoPlace
} from 'src/app/domain/models/mediafiles/mediafile.constants';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { MediafileControllerService } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-controller.service';
import { MediaManageService } from 'src/app/site/pages/meetings/services/media-manage.service';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { FileListComponent } from 'src/app/ui/modules/file-list/components/file-list/file-list.component';

import { InteractionService } from '../../../../../interaction/services/interaction.service';
import { ViewGroup } from '../../../../../participants/modules/groups/view-models/view-group';
import { MEDIAFILES_SUBSCRIPTION } from '../../../../mediafiles.subscription';
import { MediafileCommonService } from '../../../../services/mediafile-common.service';
import { MediafileListExportService } from '../../services/mediafile-list-export.service/mediafile-list-export.service';
import { MediafileListGroupService } from '../../services/mediafile-list-group.service';
import { BaseMediafileComponent } from '../../../../../../../base-media/mediafiles';

@Component({
    selector: `os-mediafile-list`,
    templateUrl: `./mediafile-list.component.html`,
    styleUrls: [`./mediafile-list.component.scss`]
})
export class MediafileListComponent extends BaseMediafileComponent implements OnInit, OnDestroy {
    @ViewChild(FileListComponent)

    public fontPlaces: string[];
    public fontDisplayNames = FontDisplayNames;

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

    public get hasInteractionState(): Observable<boolean> {
        return this.interactionService.isConfStateNone.pipe(map(isNone => !isNone));
    }
    private mediaManage = inject(MediaManageService);
    private groupRepo = inject(MediafileListGroupService);
    private interactionService = inject(InteractionService);

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService
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

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.clearSubscriptions();
        this.cd.detach();
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
            return mediafile.used_as_font_in_meeting_id(place as FontPlace) === this.activeMeetingId;
        }
        if (mediafile.isImage()) {
            return mediafile.used_as_logo_in_meeting_id(place as LogoPlace) === this.activeMeetingId;
        }
        return false;
    }

    public async changeDirectory(directoryId: number | null): Promise<void> {
        const mediafilesSubscribed = await this.modelRequestService.subscriptionGotData(MEDIAFILES_SUBSCRIPTION);
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

    /**
     * Click on the edit button in the file menu
     *
     * @param file the selected file
     */
    public override onEditFile(file: ViewMediafile): void {
        super.onEditFile(file, true);
    }

    /**
     * Sends a delete request to the repository.
     *
     * @param file the file to delete
     */
    public async onDeleteFile(file: ViewMediafile): Promise<void> {
        await this.commonService.handleDeleteFile(file, id => this.changeDirectory(id));
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

    public downloadMultiple(mediafiles: ViewMediafile[] = this.directorySubject.value): void {
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
}
