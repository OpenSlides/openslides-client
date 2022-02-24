import { Id } from 'app/core/definitions/key-types';
import { HasMeeting } from 'app/management/models/view-meeting';
import { ListOfSpeakers } from 'app/shared/models/agenda/list-of-speakers';
import { SpeakerState } from 'app/shared/models/agenda/speaker';
import { HasListOfSpeakersId } from 'app/shared/models/base/has-list-of-speakers-id';
import { Projectiondefault } from 'app/shared/models/projector/projector';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { DetailNavigable } from 'app/site/base/detail-navigable';

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
        return this.waitingSpeakers ? this.waitingSpeakers.length : 0;
    }

    public get waitingSpeakers(): ViewSpeaker[] | undefined {
        return this.speakers?.filter(speaker => speaker.state === SpeakerState.WAITING);
    }

    public get listOfSpeakersUrl(): string {
        return `/${this.getActiveMeetingId()}/agenda/speakers/${this.id}`;
    }

    public getProjectiondefault(): Projectiondefault {
        return Projectiondefault.listOfSpeakers;
    }

    public hasSpeakerSpoken(checkSpeaker: ViewSpeaker): boolean {
        return checkSpeaker.state === SpeakerState.FINISHED;
    }

    public findUserIndexOnList(userId: number): number {
        const viewSpeaker: ViewSpeaker = this.getSpeakerByUserId(userId);
        if (!viewSpeaker) {
            return UserListIndexType.NotOnList;
        } else if (viewSpeaker.state === SpeakerState.CURRENT) {
            return UserListIndexType.Active;
        } else if (viewSpeaker.state === SpeakerState.FINISHED) {
            return UserListIndexType.Finished;
        } else {
            return viewSpeaker.speaker.weight;
        }
    }

    public getSpeakerByUserId(userId: Id): ViewSpeaker | null {
        return this.speakers.find(speaker => speaker.speaker.user_id === userId);
    }

    public isUserOnList(userId: number): boolean {
        return !!this.speakers.find(speaker => {
            return speaker.speaker.user_id === userId;
        });
    }

    public getDetailStateUrl(): string {
        return `/${this.getActiveMeetingId()}/agenda/speakers/${this.sequential_number}`;
    }
}
interface IListOfSpeakersRelations {
    content_object?: BaseViewModel & HasListOfSpeakers;
    speakers: ViewSpeaker[];
}
export interface ViewListOfSpeakers extends ListOfSpeakers, IListOfSpeakersRelations, HasMeeting {}
