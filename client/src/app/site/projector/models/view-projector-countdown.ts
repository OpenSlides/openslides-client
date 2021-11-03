import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { Projectiondefault } from 'app/shared/models/projector/projector';
import { ProjectorCountdown } from 'app/shared/models/projector/projector-countdown';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { ProjectionBuildDescriptor } from 'app/site/base/projection-build-descriptor';

export class ViewProjectorCountdown extends BaseProjectableViewModel<ProjectorCountdown> {
    public static COLLECTION = ProjectorCountdown.COLLECTION;
    protected _collection = ProjectorCountdown.COLLECTION;

    public get countdown(): ProjectorCountdown {
        return this._model;
    }

    public getProjectionBuildDescriptor(): ProjectionBuildDescriptor {
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

    public getProjectiondefault(): Projectiondefault {
        return Projectiondefault.projectorCountdown;
    }
}
interface IProjectorCountdownRelations {
    meeting: ViewMeeting[];
}
export interface ViewProjectorCountdown extends ProjectorCountdown, IProjectorCountdownRelations {}
