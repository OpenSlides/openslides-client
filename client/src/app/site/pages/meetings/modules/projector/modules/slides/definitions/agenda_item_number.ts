export interface TitleInformationWithAgendaItem {
    agenda_item_number: string;
    agenda_item: { item_number: string };
}

// This is a hack to circumvent the relating handling for the title functions.
// E.g. for topics, the title function would use `topic.agenda_item.item_number`, which
// should refer to the provided `agenda_item_number` in the payload.
// Note that not every object has a agenda item number in it's title information.
export function modifyAgendaItemNumber(titleInformation: TitleInformationWithAgendaItem): void {
    if (titleInformation?.agenda_item_number) {
        titleInformation.agenda_item = { item_number: titleInformation.agenda_item_number };
    }
}
