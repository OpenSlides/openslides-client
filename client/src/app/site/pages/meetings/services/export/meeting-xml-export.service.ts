import { inject, Service } from '@angular/core';
import { FileExportService } from '@app/gateways/export/file-export.service';

import { ViewAgendaItem } from '../../pages/agenda';

@Service()
export class MeetingXmlExportService {
    private exporter = inject(FileExportService);
    private serializer = new XMLSerializer();

    public export(source: ViewAgendaItem[], filename: string): void {
        const xml = this.generateXML(source);
        this.exporter.saveFile(xml, filename, 'application/xml');
    }

    private generateXML(source: ViewAgendaItem[]): string {
        const doc = document.implementation.createDocument('', 'Agenda-Export', null);
        const root = doc.documentElement;
        const itemMap = new Map(source.map(item => [item.id, item]));
        const mainAgendaTopics = source.filter(item => !item.parent_id);
        for (const item of mainAgendaTopics) {
            root.appendChild(this.createAgendaTopic(item, doc, itemMap, false));
        }
        return this.serializer.serializeToString(doc);
    }

    private createAgendaTopic(
        item: ViewAgendaItem,
        doc,
        itemMap: Map<number, ViewAgendaItem<any>>,
        isNested = false
    ): HTMLElement {
        const agendaItem = doc.createElement(isNested ? 'Sub-Agenda-Item' : 'Agenda-Item');

        if (item.item_number) {
            const item_number = doc.createElement('item-number');
            item_number.textContent = item.item_number;
            agendaItem.appendChild(item_number);
        }
        if (item.content_object?.title) {
            const title = doc.createElement('title');
            title.textContent = item.content_object.title;
            agendaItem.appendChild(title);
        }
        if (item.content_object?.text) {
            const text = doc.createElement('text');
            text.textContent = item.content_object.text;
            agendaItem.appendChild(text);
        }
        if (item.content_object?.list_of_speakers.moderator_notes) {
            const moderator_notes = doc.createElement('moderation_notes');
            moderator_notes.textContent = item.content_object?.list_of_speakers.moderator_notes;
            agendaItem.appendChild(moderator_notes);
        }
        if (item.content_object?.list_of_speakers?.speaker_ids) {
            const list_of_speakers = doc.createElement('list_of_speakers');
            list_of_speakers.textContent = String(item.content_object.list_of_speakers?.speaker_ids?.length);
            agendaItem.appendChild(list_of_speakers);
        }
        if (item.comment) {
            const agenda_comment = doc.createElement('agenda_comment');
            agenda_comment.textContent = String(item.comment);
            agendaItem.appendChild(agenda_comment);
        }
        if (item.duration) {
            const agenda_duration = doc.createElement('agenda_duration');
            agenda_duration.textContent = String(item.duration);
            agendaItem.appendChild(agenda_duration);
        }
        if (item.type) {
            const agenda_type = doc.createElement('agenda_type');
            agenda_type.textContent = String(item.type);
            agendaItem.appendChild(agenda_type);
        }
        if (item.tags?.length) {
            const tags = doc.createElement('tags');
            item.tags.filter(tagName => {
                const tag = doc.createElement('tag');
                tag.textContent = tagName.tag.name;
                tags.appendChild(tag);
            });
            agendaItem.appendChild(tags);
        }
        if (item.closed) {
            const agenda_closed = doc.createElement('agenda_closed');
            agenda_closed.textContent = String(item.closed);
            agendaItem.appendChild(agenda_closed);
        }

        for (const childId of item.child_ids ?? []) {
            const child = itemMap.get(childId);
            if (child) {
                agendaItem.appendChild(this.createAgendaTopic(child, doc, itemMap, true));
            }
        }

        return agendaItem;
    }
}
