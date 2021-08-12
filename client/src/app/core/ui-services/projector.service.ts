import { Injectable } from '@angular/core';

import { ActiveMeetingService } from '../core-services/active-meeting.service';
import { isProjectable, Projectable } from 'app/site/base/projectable';
import { ProjectionBuildDescriptor } from 'app/site/base/projection-build-descriptor';
import { ViewProjection } from 'app/site/projector/models/view-projection';
import { ViewProjector } from 'app/site/projector/models/view-projector';
import { Collection } from '../definitions/key-types';
import { MeetingSettingsService } from './meeting-settings.service';

export interface SlideData<T = { error?: string }> {
    collection: Collection;
    data: T;
    stable: boolean;
    type: string;
    options: {
        [key: string]: any;
    };
    error?: string;
}

/**
 * This service cares about Projectables being projected and manage all projection-related
 * actions.
 *
 * We cannot access the ProjectorRepository here, so we will deal with plain projector objects.
 */
@Injectable({
    providedIn: 'root'
})
export class ProjectorService {
    public constructor(
        private activeMeetingService: ActiveMeetingService,
        private meetingSettingsService: MeetingSettingsService
    ) {}

    public ensureDescriptor(obj: ProjectionBuildDescriptor | Projectable): ProjectionBuildDescriptor {
        return isProjectable(obj) ? obj.getProjectionBuildDescriptor(this.meetingSettingsService) : obj;
    }

    /**
     * Checks if a given descriptor is projected.
     *
     * @param descriptor The descriptor in question
     * @returns true, if the descriptor is projected on one projector.
     */
    public isProjected(obj: ProjectionBuildDescriptor | Projectable): boolean {
        const descriptor = this.ensureDescriptor(obj);
        const projectors = this.activeMeetingService.meeting?.projectors || [];
        return projectors.some(projector => this.isProjectedOn(descriptor, projector));
    }

    /**
     * Checks, if the object is projected on the given projector.
     *
     * @param descriptor The ProjectionBuildDescriptor
     * @param projector The projector to test
     * @returns true, if the object is projected on the projector.
     */
    public isProjectedOn(obj: ProjectionBuildDescriptor | Projectable, projector: ViewProjector): boolean {
        const descriptor = this.ensureDescriptor(obj);
        return projector.current_projections.some(projection => projection.isEqualToDescriptor(descriptor));
    }

    public getMatchingProjectionsFromProjector(
        obj: ProjectionBuildDescriptor | Projectable,
        projector: ViewProjector
    ): ViewProjection[] {
        const descriptor = this.ensureDescriptor(obj);
        return projector.current_projections.filter(projection => projection.isEqualToDescriptor(descriptor));
    }

    public getProjectorsWhichAreProjecting(obj: ProjectionBuildDescriptor | Projectable): ViewProjector[] {
        const descriptor = this.ensureDescriptor(obj);
        return this.activeMeetingService.meeting?.projectors.filter(projector => {
            if (projector) {
                return this.isProjectedOn(descriptor, projector);
            }
            return null;
        });
    }
}
