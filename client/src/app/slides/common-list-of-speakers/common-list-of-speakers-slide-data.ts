import { SpeechState } from 'app/shared/models/agenda/speaker';

import { TitleInformationWithAgendaItem } from '../agenda_item_number';

export interface SlideSpeaker {
    user: string;
    speech_state: SpeechState;
    note: string;
    point_of_order: boolean;
}

interface TitleInformation extends TitleInformationWithAgendaItem {
    collection: string;
    [key: string]: any; // Each content object can have a variety of fields.
}

export interface CommonListOfSpeakersSlideData {
    waiting: SlideSpeaker[];
    current?: SlideSpeaker;
    finished: SlideSpeaker[];
    title_information: TitleInformation;
    closed: boolean;
    number_of_waiting_speakers?: number;
}
