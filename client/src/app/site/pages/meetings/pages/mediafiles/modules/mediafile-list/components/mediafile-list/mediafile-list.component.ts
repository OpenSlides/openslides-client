import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { FontDisplayNames, FontPlace, LogoPlace } from 'src/app/domain/models/mediafiles/mediafile.constants';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { MediaManageService } from 'src/app/site/pages/meetings/services/media-manage.service';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { FileListComponent } from 'src/app/ui/modules/file-list/components/file-list/file-list.component';

import { MediafileListeComponent } from '../../../../../../../base-media/mediafiles';
import { InteractionService } from '../../../../../interaction/services/interaction.service';
import { ViewGroup } from '../../../../../participants/modules/groups/view-models/view-group';
import { MediafileListGroupService } from '../../services/mediafile-list-group.service';

@Component({
    selector: `os-mediafile-list`,
    templateUrl: `./mediafile-list.component.html`,
    styleUrls: [`./mediafile-list.component.scss`]
})
export class MediafileListComponent extends MediafileListeComponent implements OnInit, OnDestroy {
    @ViewChild(FileListComponent)
    public fontPlaces: string[];

    protected readonly isOrgaLevel = false;

    public fontDisplayNames = FontDisplayNames;

    public groupsBehaviorSubject: Observable<ViewGroup[]>;

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
    public override ngOnInit(): void {
        super.setTitle(`Files`);

        const directoryId = +this.route.snapshot.params?.[`id`] || null;
        this.changeDirectory(directoryId);
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.clearSubscriptions();
        this.cd.detach();
    }

    public override async changeDirectory(directoryId: number | null): Promise<void> {
        return super.changeDirectory(directoryId, this.isOrgaLevel);
    }

    /**
     * Click on the edit button in the file menu
     *
     * @param file the selected file
     */
    public override onEditFile(file: ViewMediafile): void {
        super.onEditFile(file, this.isOrgaLevel);
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

    private async toggleLogoUsage(file: ViewMediafile, place: LogoPlace): Promise<void> {
        if (this.isMediafileUsed(file, place, this.isOrgaLevel)) {
            await this.mediaManage.unsetLogo(place);
        } else {
            await this.mediaManage.setLogo(place, file);
        }
    }

    private async toggleFontUsage(file: ViewMediafile, place: FontPlace): Promise<void> {
        if (this.isMediafileUsed(file, place, this.isOrgaLevel)) {
            await this.mediaManage.unsetFont(place);
        } else {
            await this.mediaManage.setFont(place, file);
        }
    }
}
