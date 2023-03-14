import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

import {
    PROJECTIONDEFAULT,
    ProjectiondefaultValue
} from '../../../../../../domain/models/projector/projection-default';
import { ProjectorCountdown } from '../../../../../../domain/models/projector/projector-countdown';
import { BaseProjectableViewModel } from '../../../view-models/base-projectable-model';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ProjectionBuildDescriptor } from '../../../view-models/projection-build-descriptor';
export class ViewProjectorCountdown extends BaseProjectableViewModel<ProjectorCountdown> {
    public static COLLECTION = ProjectorCountdown.COLLECTION;
    protected _collection = ProjectorCountdown.COLLECTION;

    public get countdown(): ProjectorCountdown {
        return this._model;
    }

    public override getProjectionBuildDescriptor(): ProjectionBuildDescriptor {
        return {
            content_object_id: this.fqid,
            stable: true,
            slideOptions: [
                {
                    key: `fullscreen`,
                    displayName: _(`Fullscreen`),
                    default: false
                },
                {
                    key: `displayType`,
                    displayName: _(`Display type`),
                    choices: [
                        { value: `onlyCountdown`, displayName: _(`Only countdown`) },
                        { value: `countdownAndTimeIndicator`, displayName: _(`Countdown and traffic light`) },
                        { value: `onlyTimeIndicator`, displayName: _(`Only traffic light`) }
                    ],
                    default: `onlyCountdown`
                }
            ],
            projectionDefault: this.getProjectiondefault(),
            getDialogTitle: this.getTitle
        };
    }

    public getProjectiondefault(): ProjectiondefaultValue {
        return PROJECTIONDEFAULT.projectorCountdown;
    }
}
interface ProjectorCountdownRelations {
    used_as_list_of_speakers_countdown_meeting: ViewMeeting;
    used_as_poll_countdown_meeting: ViewMeeting;
}
export interface ViewProjectorCountdown extends ProjectorCountdown, ProjectorCountdownRelations, HasMeeting {}
