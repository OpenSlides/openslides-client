import { Injectable } from '@angular/core';
import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { MeetingProjectionType } from 'app/core/repositories/management/meeting-repository.service';
import { ProjectorRepositoryService } from 'app/core/repositories/projector/projector-repository.service';
import { ProjectorService } from 'app/core/ui-services/projector.service';
import { Projectiondefault } from 'app/shared/models/projector/projector';
import { ProjectionBuildDescriptor } from 'app/site/base/projection-build-descriptor';

import { ViewProjector } from '../models/view-projector';

/**
 */
@Injectable({
    providedIn: `root`
})
export class CurrentSpeakerChyronSlideService {
    public constructor(
        private projectorService: ProjectorService,
        private activeMeetingIdService: ActiveMeetingIdService,
        private projectorRepo: ProjectorRepositoryService
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
            projectionDefault: Projectiondefault.currentListOfSpeakers,
            stable: true,
            getDialogTitle: () => `Current speaker chyron`
        };
    }

    /**
     * Queries, if the slide/overlay is projected on the given projector.
     *
     * @param projector The projector
     * @param overlay True, if we query for an overlay instead of the slide
     * @returns if the slide/overlay is projected on the projector
     */
    public isProjectedOn(projector: ViewProjector): boolean {
        const descriptor = this.getProjectionBuildDescriptor();
        if (!descriptor) {
            return false;
        }
        return this.projectorService.isProjectedOn(descriptor, projector);
    }

    /**
     * Toggle the projection state of the slide/overlay on the given projector
     *
     * @param projector The projector
     * @param overlay Slide or overlay
     */
    public async toggleOn(projector: ViewProjector): Promise<void> {
        const descriptor = this.getProjectionBuildDescriptor();
        if (!descriptor) {
            return;
        }
        this.projectorRepo.toggle(descriptor, [projector]);
    }
}
