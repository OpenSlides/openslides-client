/**
 * Parses values of a given model for creating an agenda-item.
 *
 * @param model A model, that can be added to an agenda.
 *
 * @returns Given information of the creation of an agenda-item for the given model.
 */
export function createAgendaItem(model: any, setTag = true): any {
    return {
        agenda_comment: model.agenda_comment,
        agenda_create: model.agenda_create,
        agenda_duration: parseInt(model.agenda_duration, 10) || undefined,
        agenda_parent_id: model.agenda_parent_id,
        agenda_type: model.agenda_type,
        agenda_weight: model.agenda_weight,
        agenda_tag_ids: setTag ? model.tag_ids : undefined
    };
}
