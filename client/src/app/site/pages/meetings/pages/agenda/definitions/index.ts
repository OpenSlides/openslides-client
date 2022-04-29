export interface AgendaListTitle {
    title: string;
    subtitle?: string;
}

export enum SpeakerStateOnList {
    Finished = -2,
    NotOnList = -1,
    Active = 0
}
