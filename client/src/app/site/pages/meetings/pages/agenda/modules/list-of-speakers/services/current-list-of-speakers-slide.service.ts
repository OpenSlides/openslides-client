import { Injectable } from '@angular/core';
import { PROJECTIONDEFAULT } from 'src/app/domain/models/projector/projection-default';
import { MeetingProjectionType } from 'src/app/gateways/repositories/meeting-repository.service';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { ProjectionBuildDescriptor } from 'src/app/site/pages/meetings/view-models';

import { ViewProjector } from '../../../../projectors';
import { ProjectorControllerService } from '../../../../projectors/services/projector-controller.service';

@Injectable({
    providedIn: `root`
})
export class CurrentListOfSpeakersSlideService {
    public constructor(
        private projectorService: ProjectorControllerService,
        private activeMeetingIdService: ActiveMeetingIdService
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
            projectionDefault: PROJECTIONDEFAULT.currentListOfSpeakers,
            getDialogTitle: () => `Current list of speakers`
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
        this.projectorService.toggle(descriptor, [projector]);
    }
}
