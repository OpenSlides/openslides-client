import { ViewListOfSpeakers } from './view-list-of-speakers';
import { Observable } from 'rxjs';
import { DetailNavigable, HasListOfSpeakersId } from 'src/app/domain/interfaces';

export function hasListOfSpeakers(obj: any): obj is HasListOfSpeakers {
    return !!obj && obj.list_of_speakers !== undefined && obj.list_of_speakers_id !== undefined;
}

export interface HasListOfSpeakers extends DetailNavigable, HasListOfSpeakersId {
    list_of_speakers?: ViewListOfSpeakers;
    list_of_speakers_as_observable?: Observable<ViewListOfSpeakers>;
    getListOfSpeakersTitle: () => string;
    getListOfSpeakersSlideTitle: () => string;
}
