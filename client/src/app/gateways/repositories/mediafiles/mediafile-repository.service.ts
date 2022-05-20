import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { Mediafile } from 'src/app/domain/models/mediafiles/mediafile';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { DEFAULT_FIELDSET, Fieldsets } from 'src/app/site/services/model-request-builder';

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
        const listFields: TypedFieldset<Mediafile> = fileCreationFields.concat([
            `owner_id`,
            `mimetype`,
            `filesize`,
            `create_timestamp`,
            `has_inherited_access_groups`,
            `pdf_information`,
            `access_group_ids`,
            `inherited_access_group_ids`,
            { templateField: `used_as_logo_$_in_meeting_id` },
            { templateField: `used_as_font_$_in_meeting_id` }
        ]);
        return {
            [DEFAULT_FIELDSET]: listFields,
            fileSelection: fileSelectionFields,
            fileCreation: fileCreationFields
        };
    }

    public async move(mediafiles: Identifiable[], directoryId: number | null): Promise<void> {
        const payload = {
            ids: mediafiles.map(mediafile => mediafile.id),
            parent_id: directoryId,
            owner_id: `meeting/${this.activeMeetingId}`
        };
        return this.sendActionToBackend(MediafileAction.MOVE, payload);
    }

    public async uploadFile(partialMediafile: any): Promise<Identifiable> {
        const payload = {
            owner_id: `meeting/${this.activeMeetingId}`,
            file: partialMediafile.file,
            filename: partialMediafile.filename,
            title: partialMediafile.title,
            access_group_ids: partialMediafile.access_group_ids,
            parent_id: partialMediafile.parent_id || null
        };
        return this.sendActionToBackend(MediafileAction.CREATE_FILE, payload);
    }

    public async createDirectory(partialMediafile: Partial<Mediafile>): Promise<Identifiable> {
        const payload = {
            owner_id: `meeting/${this.activeMeetingId}`,
            title: partialMediafile.title,
            access_group_ids: partialMediafile.access_group_ids || [],
            parent_id: partialMediafile.parent_id
        };
        return this.sendActionToBackend(MediafileAction.CREATE_DIRECTORY, payload);
    }

    public async update(update: any, viewMediafile: Identifiable): Promise<void> {
        const payload = {
            id: viewMediafile.id,
            access_group_ids: update.access_group_ids,
            title: update.title
        };
        return this.sendActionToBackend(MediafileAction.UPDATE, payload);
    }

    public async delete(...viewMediafiles: Identifiable[]): Promise<void> {
        const payload: Identifiable[] = viewMediafiles.map(file => ({ id: file.id }));
        return this.sendBulkActionToBackend(MediafileAction.DELETE, payload);
    }
}
