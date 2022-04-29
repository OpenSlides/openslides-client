import { TitleInformationWithAgendaItem } from '../../definitions';

interface AgendaItemTitleInformation extends TitleInformationWithAgendaItem {
    [key: string]: any; // Each content object can have a variety of fields.
}

export interface SlideItem {
    title_information: AgendaItemTitleInformation;
    depth: number;
}

export interface AgendaItemListSlideData {
    items: SlideItem[];
}
