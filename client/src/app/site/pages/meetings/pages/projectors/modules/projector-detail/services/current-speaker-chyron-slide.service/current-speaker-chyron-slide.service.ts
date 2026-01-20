import { Injectable } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
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
        private repo: ProjectorControllerService,
        private translate: TranslateService
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
            getDialogTitle: () => this.translate.instant(`Chyron`),
            slideOptions: [
                {
                    key: `chyron_type`,
                    displayName: _(`Current speaker / structure level`),
                    choices: [
                        { value: `new`, displayName: _(`single-line`) },
                        { value: `old`, displayName: _(`two-line`) },
                        { value: `none`, displayName: _(`Off`) }
                    ],
                    default: `new`
                },
                {
                    key: `agenda_item`,
                    displayName: _(`Current agenda item`),
                    choices: [
                        { value: true, displayName: _(`On`) },
                        { value: false, displayName: _(`Off`) }
                    ],
                    default: false
                }
            ]
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
