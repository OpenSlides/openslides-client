export interface SlideSpeaker {
    user: string;
    marked: boolean;
}

export interface CommonListOfSpeakersSlideData {
    waiting?: SlideSpeaker[];
    current?: SlideSpeaker;
    finished?: SlideSpeaker[];
    title_information?: {
        _agenda_item_number: string;
        agend_item_number: () => string;
        [key: string]: any;
    };
    content_object_collection?: string;
    closed?: boolean;
    list_of_speakers_show_amount_of_speakers_on_slide?: boolean;
}
