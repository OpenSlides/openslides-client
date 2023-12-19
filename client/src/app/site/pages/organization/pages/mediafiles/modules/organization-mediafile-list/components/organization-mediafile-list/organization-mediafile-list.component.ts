import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { LogoDisplayNames, LogoPlace } from 'src/app/domain/models/mediafiles/mediafile.constants';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { FileListComponent } from 'src/app/ui/modules/file-list/components/file-list/file-list.component';

import { MediafileListeComponent } from '../../../../../../../base-media/mediafiles';

@Component({
    selector: `os-organization-mediafile-list`,
    templateUrl: `./organization-mediafile-list.component.html`,
    styleUrls: [`./organization-mediafile-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationMediafileListComponent extends MediafileListeComponent implements OnInit, OnDestroy {
    @ViewChild(FileListComponent)
    public override logoPlaces: LogoPlace[] = [`web_header`];

    protected updatingLogoAndFontSettings = false;

    public readonly isOrgaLevel = true;

    /**
     * Determine if the file menu should generally be accessible, according to the users permission
     */
    public get canAccessFileMenu(): boolean {
        return this.canEdit;
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
}
