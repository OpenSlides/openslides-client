import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { Mediafile } from 'src/app/domain/models/mediafiles/mediafile';
import { MEDIAFILE_MEETING_USAGE_ID_KEYS } from 'src/app/domain/models/mediafiles/mediafile.constants';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { Fieldsets } from 'src/app/site/services/model-request-builder';

import { ActiveMeetingIdService } from '../../../site/pages/meetings/services/active-meeting-id.service';
import { TypedFieldset } from '../../../site/services/model-request-builder/model-request-builder.service';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollectorService } from '../repository-service-collector.service';
import { MediafileAction } from './mediafile.action';

@Injectable({
    providedIn: `root`
})
export class MediafileRepositoryService extends BaseRepository<ViewMediafile, Mediafile> {
    private get activeMeetingId(): number {
        return this.activeMeetingIdService.meetingId!;
    }

    public constructor(
        repositoryServiceCollector: RepositoryServiceCollectorService,
        private activeMeetingIdService: ActiveMeetingIdService
    ) {
        super(repositoryServiceCollector, Mediafile);

        this.viewModelSortFn = (a: ViewMediafile, b: ViewMediafile) => this.languageCollator.compare(a.title, b.title);
    }

    public getTitle = (viewMediafile: ViewMediafile) => viewMediafile.title;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Files` : `File`);

    public override getFieldsets(): Fieldsets<Mediafile> {
        const fileSelectionFields: TypedFieldset<Mediafile> = [`title`, `is_directory`];
        const fileCreationFields: TypedFieldset<Mediafile> = fileSelectionFields.concat([`parent_id`, `child_ids`]);
        const baseListFields: TypedFieldset<Mediafile> = fileCreationFields.concat([
            `owner_id`,
            `mimetype`,
            `filesize`,
            `create_timestamp`,
            `pdf_information`
        ]);
        const organizationListFields: TypedFieldset<Mediafile> = baseListFields.concat([`token`]);
        return {
            ...super.getFieldsets(),
            fileSelection: fileSelectionFields,
            fileCreation: fileCreationFields,
            organizationDetail: organizationListFields
        };
    }

    public async move(mediafiles: Identifiable[], directoryId: number | null): Promise<void> {
        const payload = {
            ids: mediafiles.map(mediafile => mediafile.id),
            parent_id: directoryId,
            owner_id: this.getOwnerId()
        };
        return this.sendActionToBackend(MediafileAction.MOVE, payload);
    }

    public async uploadFile(partialMediafile: any): Promise<Identifiable> {
        const variables: { [key: string]: any } = this.activeMeetingId
            ? { access_group_ids: partialMediafile.access_group_ids }
            : { token: partialMediafile.token };
        const payload = {
            owner_id: this.getOwnerId(),
            file: partialMediafile.file,
            filename: partialMediafile.filename,
            title: partialMediafile.title,
            parent_id: partialMediafile.parent_id || null,
            ...variables
        };
        return this.sendActionToBackend(MediafileAction.CREATE_FILE, payload);
    }

    public async createDirectory(partialMediafile: Partial<Mediafile>): Promise<Identifiable> {
        const variables: { [key: string]: any } = this.activeMeetingId
            ? { access_group_ids: partialMediafile.access_group_ids || [] }
            : {};
        const payload = {
            owner_id: this.getOwnerId(),
            title: partialMediafile.title,
            parent_id: partialMediafile.parent_id,
            ...variables
        };
        return this.sendActionToBackend(MediafileAction.CREATE_DIRECTORY, payload);
    }

    public async update(update: any, viewMediafile: Identifiable): Promise<void> {
        const variables: { [key: string]: any } = this.activeMeetingId
            ? { access_group_ids: update.access_group_ids }
            : { token: update.token };
        const payload = {
            id: viewMediafile.id,
            title: update.title,
            parent_id: update.parent_id,
            ...variables
        };
        return this.sendActionToBackend(MediafileAction.UPDATE, payload);
    }

    public async delete(...viewMediafiles: Identifiable[]): Promise<void> {
        const payload: Identifiable[] = viewMediafiles.map(file => ({ id: file.id }));
        return this.sendBulkActionToBackend(MediafileAction.DELETE, payload);
    }

    private getOwnerId(): string {
        return this.activeMeetingId ? `meeting/${this.activeMeetingId}` : `organization/${ORGANIZATION_ID}`;
    }

    /**
     * Adds the a meeting id function to the view mediafile.
     */
    protected override createViewModel(model: Mediafile): ViewMediafile {
        const viewModel = super.createViewModel(model);
        viewModel.getEnsuredActiveMeetingId = () => this.activeMeetingIdService.meetingId;
        return viewModel;
    }
}
