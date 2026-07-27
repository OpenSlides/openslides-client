import { inject, Service } from '@angular/core';
import { PROJECTIONDEFAULT } from '@app/domain/models/projector/projection-default';
import { MeetingProjectionType } from '@app/gateways/repositories/meeting-repository.service';
import { ActiveMeetingIdService } from '@app/site/pages/meetings/services/active-meeting-id.service';
import { ProjectionBuildDescriptor } from '@app/site/pages/meetings/view-models';

import { ViewProjector } from '../../../../projectors';
import { ProjectorControllerService } from '../../../../projectors/services/projector-controller.service';

@Service()
export class CurrentSpeakingStructureLevelSlideService {
    private projectorService = inject(ProjectorControllerService);
    private activeMeetingIdService = inject(ActiveMeetingIdService);

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
            type: MeetingProjectionType.CurrentSpeakingStructureLevel,
            stable: overlay,
            projectionDefault: PROJECTIONDEFAULT.currentListOfSpeakers,
            getDialogTitle: () => `Current speaker`
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
