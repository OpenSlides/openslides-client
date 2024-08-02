import { SpeechState } from 'src/app/domain/models/speakers/speech-state';

export interface CurrentSpeakingStructureLevelSlideData {
    id: number;
    name: string;
    color: string;
    remaining_time?: number;
    current_start_time: number;
    speech_state: SpeechState;
    point_of_order?: boolean;
}
