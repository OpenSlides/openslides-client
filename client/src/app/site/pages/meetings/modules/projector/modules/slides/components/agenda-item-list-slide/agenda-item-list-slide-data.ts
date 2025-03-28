import { TitleInformationWithAgendaItem } from '../../definitions';

interface AgendaItemTitleInformation extends TitleInformationWithAgendaItem, Record<string, any> {}

export interface SlideItem {
    title_information: AgendaItemTitleInformation;
    depth: number;
}

export interface AgendaItemListSlideData {
    items: SlideItem[];
}
