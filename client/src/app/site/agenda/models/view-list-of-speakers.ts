<<<<<<< HEAD
import { ProjectorTitle } from 'app/core/core-services/projector.service';
import { ListOfSpeakers, ListOfSpeakersWithoutNestedModels } from 'app/shared/models/agenda/list-of-speakers';
import { ContentObject } from 'app/shared/models/base/content-object';
import { BaseViewModelWithContentObject } from 'app/site/base/base-view-model-with-content-object';
=======
import { Fqid } from 'app/core/definitions/key-types';
import { ListOfSpeakers } from 'app/shared/models/agenda/list-of-speakers';
import { SpeakerState } from 'app/shared/models/agenda/speaker';
import { BaseViewModel } from 'app/site/base/base-view-model';
>>>>>>> New Models:
import { BaseViewModelWithListOfSpeakers } from 'app/site/base/base-view-model-with-list-of-speakers';
import { Projectable, ProjectorElementBuildDeskriptor } from 'app/site/base/projectable';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewProjection } from 'app/site/projector/models/view-projection';
import { ViewProjector } from 'app/site/projector/models/view-projector';
import { ViewSpeaker } from './view-speaker';

export interface ListOfSpeakersTitleInformation {
    content_object?: BaseViewModelWithListOfSpeakers;
    content_object_id: Fqid;
}

export class ViewListOfSpeakers extends BaseViewModel<ListOfSpeakers>
    implements ListOfSpeakersTitleInformation, Projectable {
    public static COLLECTION = ListOfSpeakers.COLLECTION;
    protected _collection = ListOfSpeakers.COLLECTION;

    public get listOfSpeakers(): ListOfSpeakers {
        return this._model;
    }

    /**
     * Gets the amount of waiting speakers
     */
    public get waitingSpeakerAmount(): number {
        return this.speakers.filter(speaker => speaker.state === SpeakerState.WAITING).length;
    }

    public get listOfSpeakersUrl(): string {
        return `/agenda/speakers/${this.id}`;
    }

    public getProjectorTitle(): ProjectorTitle {
        return { title: this.getTitle() };
    }

    public getSlide(): ProjectorElementBuildDeskriptor {
        return {
            getBasicProjectorElement: options => ({
                name: 'agenda/list-of-speakers',
                id: this.id,
                getNumbers: () => ['name', 'id']
            }),
            slideOptions: [],
            projectionDefaultName: 'agenda_list_of_speakers',
            getDialogTitle: () => this.getTitle()
        };
    }
}
interface IListOfSpeakersRelations {
    content_object?: BaseViewModelWithListOfSpeakers;
    speakers: ViewSpeaker[];
    projections: ViewProjection[];
    current_projectors: ViewProjector[];
    meeting: ViewMeeting;
}
export interface ViewListOfSpeakers extends ListOfSpeakers, IListOfSpeakersRelations {}
