import { DetailNavigable } from '../../../../../../domain/interfaces/detail-navigable';
import { HasAgendaItemId } from '../../../../../../domain/interfaces/has-agenda-item-id';
import { ViewAgendaItem } from './view-agenda-item';
import { AgendaListTitle } from '../definitions';
export interface HasAgendaItem extends DetailNavigable, HasAgendaItemId {
    agenda_item?: ViewAgendaItem;

    /**
     * @returns the agenda title
     */
    getAgendaSlideTitle: () => string;

    /**
     * @return the agenda title with the verbose name of the content object
     */
    getAgendaListTitle: () => AgendaListTitle;

    /**
     * @returns the (optional) descriptive text to be exported in the CSV.
     * May be overridden by inheriting classes
     */
    getCSVExportText: () => string;
}
