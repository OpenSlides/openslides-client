export interface AgendaItemCreationPayload {
    // Non-model fields for customizing the agenda item creation, optional
    agenda_create?: boolean;
    agenda_type?: number;
    agenda_parent_id?: number;
    agenda_comment?: string;
    agenda_duration?: number;
    agenda_weight?: number;
}
