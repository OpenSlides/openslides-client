import { BaseProjectableViewModel } from 'src/app/site/pages/meetings/view-models/base-projectable-model';
import { ListOfSpeakers } from 'src/app/domain/models/list-of-speakers/list-of-speakers';
import { ViewSpeaker } from './view-speaker';
import { SpeakerState } from 'src/app/domain/models/speakers/speaker-state';
import { SpeakerStateOnList } from '../../../definitions/index';
import { Projectiondefault } from 'src/app/domain/models/projector/projection-default';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { HasListOfSpeakers } from './has-list-of-speakers';
import { Projectable } from 'src/app/site/pages/meetings/view-models';
import { HasMeeting } from 'src/app/site/pages/meetings/view-models/has-meeting';
import { Id } from 'src/app/domain/definitions/key-types';
export class ViewListOfSpeakers extends BaseProjectableViewModel<ListOfSpeakers> {
    public static COLLECTION = ListOfSpeakers.COLLECTION;
    protected _collection = ListOfSpeakers.COLLECTION;

    public get listOfSpeakers(): ListOfSpeakers {
        return this._model;
    }

    public get activeSpeaker(): ViewSpeaker | undefined {
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
        return this.getDetailStateUrl();
    }

    public getProjectiondefault(): Projectiondefault {
        return Projectiondefault.listOfSpeakers;
    }

    public hasSpeakerSpoken(checkSpeaker: ViewSpeaker): boolean {
        return checkSpeaker.state === SpeakerState.FINISHED;
    }

    public findUserIndexOnList(userId: number): number {
        const viewSpeaker: ViewSpeaker | undefined = this.getSpeakerByUserId(userId);
        if (!viewSpeaker) {
            return SpeakerStateOnList.NotOnList;
        } else if (viewSpeaker.state === SpeakerState.CURRENT) {
            return SpeakerStateOnList.Active;
        } else if (viewSpeaker.state === SpeakerState.FINISHED) {
            return SpeakerStateOnList.Finished;
        } else {
            return viewSpeaker.speaker.weight;
        }
    }

    public getSpeakerByUserId(userId: Id): ViewSpeaker | undefined {
        return this.speakers.find(speaker => speaker.speaker.user_id === userId);
    }

    public isUserOnList(userId: Id): boolean {
        return !!this.speakers.find(speaker => {
            return speaker.speaker.user_id === userId;
        });
    }

    public override getDetailStateUrl(): string {
        return `/${this.getActiveMeetingId()}/agenda/speakers/${this.sequential_number}`;
    }
}
interface IListOfSpeakersRelations {
    content_object?: BaseViewModel & HasListOfSpeakers & Projectable;
    speakers: ViewSpeaker[];
}
export interface ViewListOfSpeakers extends ListOfSpeakers, IListOfSpeakersRelations, HasMeeting {}
