import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { LogoDisplayNames, LogoPlace } from 'src/app/domain/models/mediafiles/mediafile.constants';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { ORGANIZATION_SUBSCRIPTION } from 'src/app/site/pages/organization/organization.subscription';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { FileListComponent } from 'src/app/ui/modules/file-list/components/file-list/file-list.component';

import { ORGANIZATION_MEDIAFILE_LIST_SUBSCRIPTION } from '../../../../mediafiles.subscription';
import { BaseMediafileComponent } from '../../../../../../../base-media/mediafiles';

@Component({
    selector: `os-organization-mediafile-list`,
    templateUrl: `./organization-mediafile-list.component.html`,
    styleUrls: [`./organization-mediafile-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationMediafileListComponent extends BaseMediafileComponent implements OnInit, OnDestroy {
    @ViewChild(FileListComponent)
    public override logoPlaces: LogoPlace[] = [`web_header`];

    protected updatingLogoAndFontSettings = false;

    /**
     * @return true if the user can manage media files
     */
    public get canEdit(): boolean {
        return this.operator.hasOrganizationPermissions(OML.can_manage_organization);
    }

    public get shouldShowFileMenuFn(): (file: ViewMediafile) => boolean {
        return () => this.showFileMenu();
    }

    /**
     * Determine if the file menu should generally be accessible, according to the users permission
     */
    public get canAccessFileMenu(): boolean {
        return this.canEdit;
    }


    public isUsedAsLogoFn = (file: ViewMediafile) => this.isUsedAs(file);
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
            for (const filteredFile of this.repo
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

    /**
     * Determine if the given file has any extra option to show.
     * @returns wether the extra menu should be accessible
     */
    public showFileMenu(): boolean {
        return this.canEdit;
    }

    public async changeDirectory(directoryId: number | null): Promise<void> {
        const mediafilesSubscribed = (
            await Promise.all([
                this.modelRequestService.subscriptionGotData(ORGANIZATION_SUBSCRIPTION),
                this.modelRequestService.subscriptionGotData(ORGANIZATION_MEDIAFILE_LIST_SUBSCRIPTION)
            ])
        ).some(val => !!val);
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
        super.onEditFile(file);
    }

    /**
     * Sends a delete request to the repository.
     *
     * @param file the file to delete
     */
    public async onDeleteFile(file: ViewMediafile): Promise<void> {
        await this.commonService.handleDeleteFile(file, id => this.changeDirectory(id));
    }

    public downloadMultiple(mediafiles: ViewMediafile[] = this.directorySubject.value): void {
        const dirName = this.directory?.title ?? this.translate.instant(`Files`);
        const archiveName = `${dirName}`.trim();
        this.exporter.downloadArchive(archiveName, mediafiles);
    }

    private isUsedAs(file: ViewMediafile): boolean {
        const places = this.logoPlaces;
        return places.some(place => this.isMediafileUsed(file, place));
    }
}
