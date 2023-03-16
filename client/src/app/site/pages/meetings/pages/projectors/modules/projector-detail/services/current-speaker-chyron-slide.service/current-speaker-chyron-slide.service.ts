import { Injectable } from '@angular/core';
import { PROJECTIONDEFAULT } from 'src/app/domain/models/projector/projection-default';
import { MeetingProjectionType } from 'src/app/gateways/repositories/meeting-repository.service';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { ProjectorControllerService } from 'src/app/site/pages/meetings/pages/projectors/services/projector-controller.service';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { ProjectionBuildDescriptor } from 'src/app/site/pages/meetings/view-models';

import { ProjectorDetailServiceModule } from '../projector-detail-service.module';

@Injectable({ providedIn: ProjectorDetailServiceModule })
export class CurrentSpeakerChyronSlideService {
    public constructor(
        private activeMeetingIdService: ActiveMeetingIdService,
        private repo: ProjectorControllerService
    ) {}

    /**
     * @returns the slide build descriptor for the overlay or slide
     */
    public getProjectionBuildDescriptor(): ProjectionBuildDescriptor | null {
        const meetingId = this.activeMeetingIdService.meetingId;
        if (!meetingId) {
            return null;
        }
        return {
            content_object_id: `meeting/${meetingId}`,
            type: MeetingProjectionType.CurrentSpeakerChyron,
            projectionDefault: PROJECTIONDEFAULT.currentListOfSpeakers,
            stable: true,
            getDialogTitle: () => `Current speaker chyron`
        };
    }

    /**
     * Queries, if the slide/overlay is projected on the given projector.
     *
     * @param projector The projector
     *
     * @returns if the slide/overlay is projected on the projector
     */
    public isProjectedOn(projector: ViewProjector): boolean {
        const descriptor = this.getProjectionBuildDescriptor();
        if (!descriptor) {
            return false;
        }
        return this.repo.isProjectedOn(descriptor, projector);
    }

    /**
     * Toggle the projection state of the slide/overlay on the given projector
     *
     * @param projector The projector
     */
    public async toggleOn(projector: ViewProjector): Promise<void> {
        const descriptor = this.getProjectionBuildDescriptor();
        if (!descriptor) {
            return;
        }
        this.repo.toggle(descriptor, [projector]);
    }
}
