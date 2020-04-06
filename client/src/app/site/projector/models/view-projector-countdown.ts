import { _ } from 'app/core/translate/translation-marker';
import { ProjectorCountdown } from 'app/shared/models/projector/projector-countdown';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { ProjectorElementBuildDeskriptor } from 'app/site/base/projectable';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewProjection } from './view-projection';
import { ViewProjector } from './view-projector';

export interface CountdownTitleInformation {
    title: string;
    description?: string;
}

export class ViewProjectorCountdown extends BaseProjectableViewModel<ProjectorCountdown>
    implements CountdownTitleInformation {
    public static COLLECTION = ProjectorCountdown.COLLECTION;
    protected _collection = ProjectorCountdown.COLLECTION;

    public get countdown(): ProjectorCountdown {
        return this._model;
    }

    public getSlide(): ProjectorElementBuildDeskriptor {
        return {
            getBasicProjectorElement: options => ({
                stable: true,
                name: ProjectorCountdown.COLLECTION,
                id: this.id,
                getNumbers: () => ['name', 'id']
            }),
            slideOptions: [
                {
                    key: 'fullscreen',
                    displayName: _('Fullscreen'),
                    default: false
                },
                {
                    key: 'displayType',
                    displayName: _('Display type'),
                    choices: [
                        { value: 'onlyCountdown', displayName: _('Only countdown') },
                        { value: 'countdownAndTimeIndicator', displayName: _('Countdown and traffic light') },
                        { value: 'onlyTimeIndicator', displayName: _('Only traffic light') }
                    ],
                    default: 'onlyCountdown'
                }
            ],
            projectionDefaultName: 'countdowns',
            getDialogTitle: () => this.getTitle()
        };
    }
}
interface IProjectorCountdownRelations {
    projections: ViewProjection[];
    current_projectors: ViewProjector[];
    meeting: ViewMeeting[];
}
export interface ViewProjectorCountdown extends ProjectorCountdown, IProjectorCountdownRelations {}
