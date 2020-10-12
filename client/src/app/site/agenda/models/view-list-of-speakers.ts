import { ProjectorTitle } from 'app/core/core-services/projector.service';
import { ListOfSpeakers } from 'app/shared/models/agenda/list-of-speakers';
import { SpeakerState } from 'app/shared/models/agenda/speaker';
import { HasListOfSpeakersId } from 'app/shared/models/base/has-list-of-speakers-id';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { DetailNavigable } from 'app/site/base/detail-navigable';
import { ProjectorElementBuildDeskriptor } from 'app/site/base/projectable';
import { HasMeeting, ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewSpeaker } from './view-speaker';

export function hasListOfSpeakers(obj: any): obj is HasListOfSpeakers {
    return !!obj && obj.list_of_speakers !== undefined && obj.list_of_speakers_id !== undefined;
}

export enum UserListIndexType {
    Finished = -2,
    NotOnList = -1,
    Active = 0
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

    public get activeSpeaker(): ViewSpeaker {
        return this.speakers.find(speaker => speaker.state === SpeakerState.CURRENT);
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

    public findUserIndexOnList(userId: number): number {
        if (this.activeSpeaker?.user.id === userId) {
            return UserListIndexType.Active;
        } else {
            const waitingSpeakersIndex = this.waitingSpeakers.findIndex(speaker => speaker.user_id === userId);
            const finishedSpeakersIndex = this.finishedSpeakers.findIndex(speaker => speaker.user_id === userId);
            if (waitingSpeakersIndex !== -1) {
                return waitingSpeakersIndex + 1;
            } else if (finishedSpeakersIndex !== -1) {
                return UserListIndexType.Finished;
            } else {
                return UserListIndexType.NotOnList;
            }
        }
    }
}
interface IListOfSpeakersRelations {
    content_object?: BaseViewModel & HasListOfSpeakers;
    speakers: ViewSpeaker[];
}
export interface ViewListOfSpeakers extends ListOfSpeakers, IListOfSpeakersRelations, HasMeeting {}
