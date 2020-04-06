import { ProjectorTitle } from 'app/core/core-services/projector.service';
import { Fqid } from 'app/core/definitions/key-types';
import { ListOfSpeakers } from 'app/shared/models/agenda/list-of-speakers';
import { SpeakerState } from 'app/shared/models/agenda/speaker';
import { BaseViewModel } from 'app/site/base/base-view-model';
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

    public get finishedSpeakers(): ViewSpeaker[] {
        return this.speakers.filter(speaker => speaker.state === SpeakerState.FINISHED);
    }

    /**
     * Gets the amount of waiting speakers
     */
    public get waitingSpeakerAmount(): number {
        return this.waitingSpeakers.length;
    }

    public get waitingSpeakers(): ViewSpeaker[] {
        return this.speakers.filter(speaker => speaker.state === SpeakerState.WAITING);
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

    public hasSpeakerSpoken(checkSpeaker: ViewSpeaker): boolean {
        return this.finishedSpeakers.findIndex(speaker => speaker.user_id === checkSpeaker.user_id) !== -1;
    }

    public isUserOnList(userId: number): boolean {
        return !!this.speakers.find(speaker => speaker.user_id === userId);
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
