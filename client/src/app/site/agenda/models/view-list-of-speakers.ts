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

export enum UserListIndexType {
    Finished = -2,
    NotOnList = -1,
    Active = 0
}

export class ViewListOfSpeakers
    extends BaseViewModel<ListOfSpeakers>
    implements ListOfSpeakersTitleInformation, Projectable {
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
    content_object?: BaseViewModelWithListOfSpeakers;
    speakers: ViewSpeaker[];
    projections: ViewProjection[];
    current_projectors: ViewProjector[];
    meeting: ViewMeeting;
}
export interface ViewListOfSpeakers extends ListOfSpeakers, IListOfSpeakersRelations {}
