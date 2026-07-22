import { inject, Service } from '@angular/core';
import { ActiveMeetingService } from '@app/site/pages/meetings/services/active-meeting.service';
import { MeetingSettingsService } from '@app/site/pages/meetings/services/meeting-settings.service';
import { isProjectable, Projectable, ProjectionBuildDescriptor } from '@app/site/pages/meetings/view-models';

@Service()
export class ProjectableListService {
    private activeMeetingService = inject(ActiveMeetingService);
    private meetingSettingsService = inject(MeetingSettingsService);

    public isProjected(model: ProjectionBuildDescriptor | Projectable | null): boolean {
        if (!model) {
            return false;
        }
        const descriptor = this.ensureDescriptor(model);
        const projectors = this.activeMeetingService.meeting?.projectors || [];
        return projectors.some(projector => {
            return projector.current_projections.some(projection => projection.isEqualToDescriptor(descriptor));
        });
    }

    public isProjectedOnReferenceProjector(model: ProjectionBuildDescriptor | Projectable | null): boolean {
        if (!model) {
            return false;
        }
        const descriptor = this.ensureDescriptor(model);
        const projector = this.activeMeetingService.meeting?.reference_projector;
        return projector?.current_projections.some(projection => projection.isEqualToDescriptor(descriptor));
    }

    private ensureDescriptor(obj: ProjectionBuildDescriptor | Projectable): ProjectionBuildDescriptor {
        return isProjectable(obj) ? obj.getProjectionBuildDescriptor(this.meetingSettingsService)! : obj;
    }
}
