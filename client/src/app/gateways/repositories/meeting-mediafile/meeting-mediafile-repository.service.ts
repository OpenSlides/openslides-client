import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { MeetingMediafile } from 'src/app/domain/models/meeting-mediafile/meeting-mediafile';
import { ViewMeetingMediafile } from 'src/app/site/pages/meetings/pages/mediafiles/view-models/view-meeting-mediafile';

import { ActiveMeetingIdService } from '../../../site/pages/meetings/services/active-meeting-id.service';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollectorService } from '../repository-service-collector.service';

@Injectable({
    providedIn: `root`
})
export class MeetingMediafileRepositoryService extends BaseRepository<ViewMeetingMediafile, MeetingMediafile> {
    private mediafileMap = new Map<Id, Map<Id, Id>>();

    public constructor(
        repositoryServiceCollector: RepositoryServiceCollectorService,
        private activeMeetingIdService: ActiveMeetingIdService
    ) {
        super(repositoryServiceCollector, MeetingMediafile);

        this.viewModelSortFn = (a: ViewMeetingMediafile, b: ViewMeetingMediafile): number =>
            this.languageCollator.compare(a.mediafile?.title, b.mediafile?.title);
    }

    public getTitle = (viewMeetingMediafile: ViewMeetingMediafile): string => viewMeetingMediafile.mediafile?.title;

    public getVerboseName = (plural = false): string => this.translate.instant(plural ? `Files` : `File`);

    public getIdByMediafile(meetingId: Id, mediafileId: Id): Id | null {
        return this.mediafileMap.has(meetingId) ? this.mediafileMap.get(meetingId).get(mediafileId) : null;
    }

    public override deleteModels(ids: Id[]): void {
        for (const id of ids) {
            const viewModel = this.viewModelStore[id];
            if (viewModel.mediafile_id && viewModel.meeting_id) {
                try {
                    this.mediafileMap.get(viewModel.meeting_id).set(viewModel.meeting_id, id);
                } catch (e) {}
            }
        }
        super.deleteModels(ids);
    }

    protected override onCreateViewModel(meetingMediafile: ViewMeetingMediafile): void {
        if (meetingMediafile.mediafile_id && meetingMediafile.meeting_id) {
            if (!this.mediafileMap.has(meetingMediafile.meeting_id)) {
                this.mediafileMap.set(meetingMediafile.meeting_id, new Map());
            }

            this.mediafileMap.get(meetingMediafile.meeting_id).set(meetingMediafile.mediafile_id, meetingMediafile.id);
        }
    }

    protected override clearViewModelStore(): void {
        this.mediafileMap = new Map();
        super.clearViewModelStore();
    }

    /**
     * Adds the a meeting id function to the view mediafile.
     */
    protected override createViewModel(model: MeetingMediafile): ViewMeetingMediafile {
        const viewModel = super.createViewModel(model);
        viewModel.getEnsuredActiveMeetingId = (): number => this.activeMeetingIdService.meetingId;
        return viewModel;
    }
}
