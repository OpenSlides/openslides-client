import { DetailNavigable, HasListOfSpeakersId } from 'src/app/domain/interfaces';
import { ViewModelRelations } from 'src/app/site/base/base-view-model';

import { ViewListOfSpeakers } from './view-list-of-speakers';

export function hasListOfSpeakers(obj: any): obj is HasListOfSpeakers {
    return !!obj && obj.list_of_speakers !== undefined && obj.list_of_speakers_id !== undefined;
}

export type HasListOfSpeakers = DetailNavigable &
    HasListOfSpeakersId &
    ViewModelRelations<{
        list_of_speakers?: ViewListOfSpeakers;
    }> & {
        getListOfSpeakersTitle: () => string;
        getListOfSpeakersSlideTitle: () => string;
    };
