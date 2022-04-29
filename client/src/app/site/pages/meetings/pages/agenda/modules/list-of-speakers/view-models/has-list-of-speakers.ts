import { DetailNavigable } from '../../../../../../../../domain/interfaces/detail-navigable';
import { HasListOfSpeakersId } from '../../../../../../../../domain/interfaces/has-list-of-speakers-id';
import { ViewListOfSpeakers } from './view-list-of-speakers';

export function hasListOfSpeakers(obj: any): obj is HasListOfSpeakers {
    return !!obj && obj.list_of_speakers !== undefined && obj.list_of_speakers_id !== undefined;
}

export interface HasListOfSpeakers extends DetailNavigable, HasListOfSpeakersId {
    list_of_speakers?: ViewListOfSpeakers;
    getListOfSpeakersTitle: () => string;
    getListOfSpeakersSlideTitle: () => string;
}
