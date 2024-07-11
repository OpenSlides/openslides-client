import { SpeechState } from 'src/app/domain/models/speakers/speech-state';

import { TitleInformationWithAgendaItem } from '../../../../definitions';

export interface SlideSpeaker {
    user: string;
    speech_state: SpeechState;
    note: string;
    point_of_order: boolean;
    begin_time: number;
    pause_time: number;
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
