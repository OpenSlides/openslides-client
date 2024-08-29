import { Injectable } from '@angular/core';
import { MeetingMediafile } from 'src/app/domain/models/meeting-mediafile/meeting-mediafile';
import { ViewMeetingMediafile } from 'src/app/site/pages/meetings/pages/mediafiles/view-models/view-meeting-mediafile';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';

import { ActiveMeetingIdService } from '../../../site/pages/meetings/services/active-meeting-id.service';
import { BaseRepository } from '../base-repository';
import { ProjectionRepositoryService } from '../projections/projection-repository.service';
import { RepositoryServiceCollectorService } from '../repository-service-collector.service';

@Injectable({
    providedIn: `root`
})
export class MeetingMediafileRepositoryService extends BaseRepository<ViewMeetingMediafile, MeetingMediafile> {
    private get activeMeetingId(): number {
        return this.activeMeetingIdService.meetingId!;
    }

    public constructor(
        repositoryServiceCollector: RepositoryServiceCollectorService,
        private activeMeetingIdService: ActiveMeetingIdService,
        private projectionRepo: ProjectionRepositoryService
    ) {
        super(repositoryServiceCollector, MeetingMediafile);

        this.viewModelSortFn = (a: ViewMeetingMediafile, b: ViewMeetingMediafile): number =>
            this.languageCollator.compare(a.title, b.title);
    }

    public getTitle = (viewMeetingMediafile: ViewMeetingMediafile): string => viewMeetingMediafile.title;

    public getVerboseName = (plural = false): string => this.translate.instant(plural ? `Files` : `File`);

    /**
     * Adds the a meeting id function to the view mediafile.
     */
    protected override createViewModel(model: MeetingMediafile): ViewMeetingMediafile {
        const viewModel = super.createViewModel(model);
        viewModel.getEnsuredActiveMeetingId = (): number => this.activeMeetingIdService.meetingId;
        viewModel.getProjectedContentObjects = (): string[] =>
            this.projectionRepo.getViewModelList().map(p => p.content_object_id);
        return viewModel;
    }

    public getOwnerIdAsId(): null | number {
        return this.activeMeetingId ? null : ORGANIZATION_ID;
    }
}
