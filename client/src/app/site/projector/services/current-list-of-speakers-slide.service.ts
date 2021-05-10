import { Injectable } from '@angular/core';

import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { MeetingProjectionType } from 'app/core/repositories/management/meeting-repository.service';
import { ProjectorRepositoryService } from 'app/core/repositories/projector/projector-repository.service';
import { ProjectorService } from 'app/core/ui-services/projector.service';
import { Projectiondefault } from 'app/shared/models/projector/projector';
import { ProjectionBuildDescriptor } from 'app/site/base/projection-build-descriptor';
import { ViewProjector } from '../models/view-projector';

/**
 * Handles the curent list of speakers slide. Manages the projection and provides
 * function to check, if it is projected. Handles the overlay and slide.
 */
@Injectable({
    providedIn: 'root'
})
export class CurrentListOfSpeakersSlideService {
    public constructor(
        private projectorService: ProjectorService,
        private activeMeetingIdService: ActiveMeetingIdService,
        private projectorRepo: ProjectorRepositoryService
    ) {}

    /**
     * @returns the slide build descriptor for the overlay or slide
     */
    public getProjectionBuildDescriptor(overlay: boolean): ProjectionBuildDescriptor | null {
        const meetingId = this.activeMeetingIdService.meetingId;
        if (!meetingId) {
            return null;
        }
        return {
            content_object_id: `meeting/${meetingId}`,
            type: MeetingProjectionType.CurrentListOfSpeakers,
            stable: overlay,
            projectionDefault: Projectiondefault.currentListOfSpeakers,
            getDialogTitle: () => 'Current list of speakers'
        };
    }

    /**
     * Queries, if the slide/overlay is projected on the given projector.
     *
     * @param projector The projector
     * @param overlay True, if we query for an overlay instead of the slide
     * @returns if the slide/overlay is projected on the projector
     */
    public isProjectedOn(projector: ViewProjector, overlay: boolean): boolean {
        const descriptor = this.getProjectionBuildDescriptor(overlay);
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
    public async toggleOn(projector: ViewProjector, overlay: boolean): Promise<void> {
        const descriptor = this.getProjectionBuildDescriptor(overlay);
        if (!descriptor) {
            return;
        }
        this.projectorRepo.project(descriptor, [projector]);
    }
}
