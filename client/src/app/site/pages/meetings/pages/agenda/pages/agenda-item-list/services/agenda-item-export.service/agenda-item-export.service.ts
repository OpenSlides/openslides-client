import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Content } from 'pdfmake/interfaces';
import { OSTreeNode } from 'src/app/infrastructure/definitions/tree';
import { ViewAgendaItem } from 'src/app/site/pages/meetings/pages/agenda';
import { MeetingPdfExportService } from 'src/app/site/pages/meetings/services/export';
import { MeetingCsvExportForBackendService } from 'src/app/site/pages/meetings/services/export/meeting-csv-export-for-backend.service';
import { TreeService } from 'src/app/ui/modules/sorting/modules/sorting-tree/services';

import { AgendaItemListServiceModule } from '../agenda-item-list-service.module';

/**
 * pdfMake structure for a content line in the pdf document.
 */
interface AgendaTreePdfEntry {
    style: string;
    columns: { width?: number; text: string }[];
}

export enum ExportFileFormat {
    PDF = 0,
    CSV
}

export type InfoToExport =
    | `item_number`
    | `title`
    | `text`
    | `attachments`
    | `moderation_notes`
    | `list_of_speakers`
    | `polls`
    | `internal_commentary`;

export type pdfMetaInfo = `table_of_content` | `line_break` | `header` | `footer` | `current_date`;

export type csvMetaInfo = `duration` | `tags` | `agenda_visibility` | `done`;

@Injectable({
    providedIn: AgendaItemListServiceModule
})
export class AgendaItemExportService {
    public constructor(
        private translate: TranslateService,
        private csvExportService: MeetingCsvExportForBackendService,
        private pdfExportService: MeetingPdfExportService,
        private treeService: TreeService
    ) {}

    public exportAsCsv(source: ViewAgendaItem[], info: InfoToExport[], csvMeta: csvMetaInfo): void {
        const config = [];
        if (info.includes(`item_number`)) {
            config.push({ label: `item_number`, property: `item_number` });
        }
        if (info.includes(`title`)) {
            config.push({ label: `title`, map: (viewItem): string => viewItem.getTitle() });
        }
        if (info.includes(`text`)) {
            config.push({
                label: `text`,
                map: (viewItem): string =>
                    viewItem.content_object?.getCSVExportText ? viewItem.content_object.getCSVExportText() : ``
            });
        }
        if (info.includes(`moderation_notes`)) {
            config.push({
                label: `moderation_notes`,
                map: (viewItem): string => viewItem.content_object?.list_of_speakers?.moderator_notes ?? ``
            });
        }
        if (info.includes(`list_of_speakers`)) {
            config.push({
                label: `list_of_speakers`,
                map: (viewItem): string => {
                    if (
                        viewItem.content_object?.list_of_speakers &&
                        viewItem.content_object.list_of_speakers.waitingSpeakerAmount > 0
                    ) {
                        return viewItem.content_object?.list_of_speakers.waitingSpeakerAmount.toString();
                    }
                    return ``;
                }
            });
        }
        if (info.includes(`internal_commentary`)) {
            config.push({ label: `agenda_comment`, property: `comment` });
        }
        if (csvMeta.includes(`duration`)) {
            config.push({ label: `agenda_duration`, property: `duration` });
        }
        if (csvMeta.includes(`agenda_visibility`)) {
            config.push({ label: `agenda_type`, property: `verboseCsvType` });
        }
        if (csvMeta.includes(`tags`)) {
            config.push({
                label: `tags`,
                map: (viewItem): string => viewItem.tags?.map(tag => tag.getTitle()).join(`,`) ?? ``
            });
        }
        if (csvMeta.includes(`done`)) {
            config.push({ label: `agenda_closed`, property: `closed` });
        }

        this.csvExportService.export(source, config, this.translate.instant(`Agenda`) + `.csv`);
    }

    public exportAsPdf(source: ViewAgendaItem[], _info: InfoToExport[], _meta: pdfMetaInfo[]): void {
        const filename = this.translate.instant(`Agenda`);
        this.pdfExportService.download({ docDefinition: this.agendaListToDocDef(source), filename });
    }

    /**
     * Creates pdfMake definitions for a agenda list pdf from the given agenda items
     *
     * @param items A list of viewItems to be included in this agenda list. Items with the property 'hidden'
     * will be ignored, all other items will be sorted by their parents and weight
     * @returns definitions ready to be opened or exported via {@link PdfDocumentService}
     */
    private agendaListToDocDef(items: ViewAgendaItem[]): Content[] {
        const tree: OSTreeNode<ViewAgendaItem>[] = this.treeService.makeSortedTree(items, `weight`, `parent_id`);
        const title = {
            text: this.translate.instant(`Agenda`),
            style: `title`
        };
        const entries = this.createEntries(tree);
        return [title, entries];
    }

    /**
     * Traverses the given nodeTree and creates an array of entries for all items
     *
     * @param tree
     * @returns hierarchical pdfMake definitions for topic entries
     */
    private createEntries(tree: OSTreeNode<ViewAgendaItem>[]): AgendaTreePdfEntry[] {
        const content: AgendaTreePdfEntry[] = [];
        tree.forEach(treeitem => content.push(...this.parseItem(treeitem, 0)));
        return content;
    }

    /**
     * Parses an entry line and triggers parsing of any children
     * Items with 'is_hidden' and their subitems are not exported
     *
     * @param nodeItem the item for the head line
     * @param level: The hierarchy index (beginning at 0 for top level agenda topics)
     * @returns pdfMake definitions for the number/title strings, indented according to hierarchy
     */
    private parseItem(nodeItem: OSTreeNode<ViewAgendaItem>, level: number): AgendaTreePdfEntry[] {
        const itemList: AgendaTreePdfEntry[] = [];
        if (!nodeItem.item.item.is_hidden) {
            // don't include hidden items and their subitems
            const resultString: AgendaTreePdfEntry = {
                style: level ? `listChild` : `listParent`,
                columns: [
                    {
                        width: level * 15,
                        text: ``
                    },
                    {
                        width: 60,
                        text: nodeItem.item.item_number || ``
                    },
                    {
                        text: nodeItem.item.content_object!.getTitle()
                    }
                ]
            };
            itemList.push(resultString);
            if (nodeItem.children && nodeItem.children.length) {
                nodeItem.children.forEach(child => {
                    itemList.push(...this.parseItem(child, level + 1));
                });
            }
        }
        return itemList;
    }
}
