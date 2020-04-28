import { ProjectorTitle } from 'app/core/core-services/projector.service';
import { ListOfSpeakers } from 'app/shared/models/agenda/list-of-speakers';
import { SpeakerState } from 'app/shared/models/agenda/speaker';
import { HasListOfSpeakersId } from 'app/shared/models/base/has-list-of-speakers-id';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { DetailNavigable } from 'app/site/base/detail-navigable';
import { ProjectorElementBuildDeskriptor } from 'app/site/base/projectable';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewSpeaker } from './view-speaker';

export function hasListOfSpeakers(obj: any): obj is HasListOfSpeakers {
    return !!obj && obj.list_of_speakers !== undefined && obj.list_of_speakers_id !== undefined;
}

export interface HasListOfSpeakers extends DetailNavigable, HasListOfSpeakersId {
    list_of_speakers?: ViewListOfSpeakers;
    getListOfSpeakersTitle: () => string;
    getListOfSpeakersSlideTitle: () => string;
}

export class ViewListOfSpeakers extends BaseProjectableViewModel<ListOfSpeakers> {
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
    content_object?: BaseViewModel & HasListOfSpeakers;
    speakers: ViewSpeaker[];
    meeting: ViewMeeting;
}
export interface ViewListOfSpeakers extends ListOfSpeakers, IListOfSpeakersRelations {}
