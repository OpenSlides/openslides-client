import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Mediafile } from 'src/app/domain/models/mediafiles/mediafile';
import { ViewMediafile, ViewMeetingMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { Fieldsets } from 'src/app/site/services/model-request-builder';

import { TypedFieldset } from '../../../site/services/model-request-builder/model-request-builder.service';
import { BaseRepository } from '../base-repository';
import { MeetingMediafileRepositoryService } from '../meeting-mediafile/meeting-mediafile-repository.service';
import { ProjectionRepositoryService } from '../projections/projection-repository.service';
import { RepositoryServiceCollectorService } from '../repository-service-collector.service';
import { MediafileAction } from './mediafile.action';

@Injectable({
    providedIn: `root`
})
export class MediafileRepositoryService extends BaseRepository<ViewMediafile, Mediafile> {
    private get activeMeetingId(): number {
        return this.activeMeetingService.meetingId!;
    }

    public constructor(
        repositoryServiceCollector: RepositoryServiceCollectorService,
        private activeMeetingService: ActiveMeetingService,
        private projectionRepo: ProjectionRepositoryService,
        private meetingMediaRepo: MeetingMediafileRepositoryService
    ) {
        super(repositoryServiceCollector, Mediafile);

        this.viewModelSortFn = (a: ViewMediafile, b: ViewMediafile): number =>
            this.languageCollator.compare(a.title, b.title);
    }

    public getTitle = (viewMediafile: ViewMediafile): string => viewMediafile.title;

    public getVerboseName = (plural = false): string => this.translate.instant(plural ? `Files` : `File`);

    public override getFieldsets(): Fieldsets<Mediafile> {
        const fileSelectionFields: TypedFieldset<Mediafile> = [`title`, `is_directory`];
        const fileCreationFields: TypedFieldset<Mediafile> = fileSelectionFields.concat([`parent_id`, `child_ids`]);
        const baseListFields: TypedFieldset<Mediafile> = fileCreationFields.concat([
            `owner_id`,
            `mimetype`,
            `filesize`,
            `create_timestamp`,
            `pdf_information`,
            `published_to_meetings_in_organization_id`,
            `filename`
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

    public async publish(mediafile: Identifiable, publish: boolean): Promise<void> {
        const payload = {
            id: mediafile.id,
            publish: publish
        };
        return this.sendActionToBackend(MediafileAction.PUBLISH, payload);
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

    public async createDirectory(
        partialMediafile: Partial<Mediafile> & { access_group_ids: Id[] }
    ): Promise<Identifiable> {
        const variables: { [key: string]: any } = this.activeMeetingId
            ? { access_group_ids: partialMediafile.access_group_ids }
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
            meeting_id: this.activeMeetingId ?? undefined,
            ...variables
        };
        return this.sendActionToBackend(MediafileAction.UPDATE, payload);
    }

    public async delete(...viewMediafiles: Identifiable[]): Promise<void> {
        const payload: Identifiable[] = viewMediafiles.map(file => ({ id: file.id }));
        return this.sendBulkActionToBackend(MediafileAction.DELETE, payload);
    }

    public getMeetingMediafile(model: Mediafile, meetingId: Id = this.activeMeetingId): ViewMeetingMediafile {
        const meetingMediafileId = this.meetingMediaRepo.getIdByMediafile(meetingId, model.id);
        if (meetingMediafileId) {
            return this.meetingMediaRepo.getViewModel(meetingMediafileId);
        }

        return null;
    }

    private getOwnerId(): string {
        return this.activeMeetingId ? `meeting/${this.activeMeetingId}` : `organization/${ORGANIZATION_ID}`;
    }

    /**
     * Adds the a meeting id function to the view mediafile.
     */
    protected override createViewModel(model: Mediafile): ViewMediafile {
        const viewModel = super.createViewModel(model);
        viewModel.getEnsuredActiveMeetingId = (): number => this.activeMeetingId;
        viewModel.getEnsuredActiveMeeting = (): ViewMeeting => this.activeMeetingService.meeting;
        viewModel.getProjectedContentObjects = (): string[] =>
            this.projectionRepo.getViewModelList().map(p => p.content_object_id);
        viewModel.getMeetingMediafile = (): ViewMeetingMediafile => this.getMeetingMediafile(model);
        return viewModel;
    }
}
