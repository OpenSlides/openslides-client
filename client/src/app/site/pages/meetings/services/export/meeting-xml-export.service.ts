import { inject, Service } from '@angular/core';
import { FileExportService } from '@app/gateways/export/file-export.service';

import { ViewAgendaItem } from '../../pages/agenda';
import {
    csvMetaInfo,
    InfoToExport,
    xmlMetaInfo
} from '../../pages/agenda/pages/agenda-item-list/services/agenda-item-export.service/agenda-item-export.service';

@Service()
export class MeetingXmlExportService {
    private exporter = inject(FileExportService);
    private serializer = new XMLSerializer();
    private itemMap;

    public export(source: ViewAgendaItem[], filename: string, config: (InfoToExport | csvMetaInfo)[]): void {
        const xml = this.generateXML(source, config);
        this.exporter.saveFile(xml, filename, 'application/xml');
    }

    private generateXML(source: ViewAgendaItem[], config: (InfoToExport | csvMetaInfo)[]): string {
        const doc = document.implementation.createDocument('', 'Agenda-Export', null);
        const root = doc.documentElement;
        const mainAgendaTopics = source.filter(item => !item.parent_id);
        this.itemMap = new Map(source.map(item => [item.id, item]));
        for (const item of mainAgendaTopics) {
            root.appendChild(this.createAgendaTopic(item, doc, config));
        }
        return this.serializer.serializeToString(doc);
    }

    private createAgendaTopic(
        item: ViewAgendaItem,
        doc: XMLDocument,
        config: (InfoToExport | csvMetaInfo)[],
        isNested = false
    ): HTMLElement {
        const agendaItem = doc.createElement(isNested ? 'Sub-Agenda-Item' : 'Agenda-Item');

        const addContentNode = (name: InfoToExport | xmlMetaInfo, value: unknown): void => {
            if (config.includes(name) && this.isEmpty(value)) {
                const node = doc.createElement(name.replaceAll('_', '-'));
                node.textContent = String(value);
                agendaItem.appendChild(node);
            }
        };

        addContentNode('item_number', item.item_number);
        addContentNode('title', item.content_object?.title);
        addContentNode('text', item.content_object?.text);
        addContentNode('moderation_notes', item.content_object?.list_of_speakers?.moderator_notes);
        addContentNode('list_of_speakers', item.content_object?.list_of_speakers?.speaker_ids?.length);
        addContentNode('internal_commentary', item.comment);
        addContentNode('duration', item.duration);
        addContentNode('agenda_visibility', item.type);
        addContentNode('done', item.closed);

        if (item.tags?.length && config.includes('tags')) {
            const tags = doc.createElement('tags');
            item.tags.filter(tagName => {
                const tag = doc.createElement('tag');
                tag.textContent = tagName.tag.name;
                tags.appendChild(tag);
            });
            agendaItem.appendChild(tags);
        }
        item.child_ids?.forEach(childId => {
            const child = this.createAgendaTopic(this.itemMap.get(childId), doc, config, true);
            if (child) {
                agendaItem.appendChild(child);
            }
        });
        return agendaItem;
    }

    private isEmpty(value: any): boolean {
        return value !== undefined && value !== null && value !== '' && value !== 0;
    }
}
