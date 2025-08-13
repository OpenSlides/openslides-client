import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Content } from 'pdfmake/interfaces';
import { HtmlToPdfService } from 'src/app/gateways/export/html-to-pdf.service';
import { PdfError } from 'src/app/gateways/export/pdf-document.service';

import { MeetingPdfExportService } from '../../../../services/export';
import { ViewAgendaItem } from '../../view-models';
import { AgendaItemCommonServiceModule } from '../agenda-item-common-service.module';

const AGENDA_PDF_OPTIONS = {
    Toc: `table_of_content`,
    AddBreaks: `line_break`,
    Header: `header`,
    Footer: `footer`
};

@Injectable({
    providedIn: AgendaItemCommonServiceModule
})
export class AgendaPdfCatalogExportService {
    public constructor(
        private translate: TranslateService,
        private pdfService: MeetingPdfExportService,
        private htmlToPdfService: HtmlToPdfService
    ) {}

    /**
     * Converts the list of agenda items to pdfmake doc definition.
     * Public entry point to conversion of multiple agenda items.
     *
     * @param agendaItems the list of view agendaItem to convert
     * @param info
     * @param pdfMeta
     * @returns pdfmake doc definition as object
     */
    public agendaListToDocDef(agendaItems: ViewAgendaItem[], exportInfo: any, pdfMeta: string[]): Content {
        let doc = [];
        const agendaDocList = [];
        const printToc = pdfMeta?.includes(AGENDA_PDF_OPTIONS.Toc);
        const enforcePageBreaks = pdfMeta?.includes(AGENDA_PDF_OPTIONS.AddBreaks);

        doc.push({ text: this.translate.instant(`Agenda`), style: this.getStyle(`header1`) });
        doc.push(this.getDivLine());

        for (let agendaItemIndex = 0; agendaItemIndex < agendaItems.length; ++agendaItemIndex) {
            try {
                const agendaDocDef: any[] = this.agendaItemToDoc(agendaItems[agendaItemIndex], exportInfo, pdfMeta);

                // add id field to the first page of a motion to make it findable over TOC
                agendaDocDef[0].id = `${agendaItems[agendaItemIndex].id}`;

                agendaDocList.push(agendaDocDef);

                if (agendaItemIndex < agendaItems.length - 1 && enforcePageBreaks) {
                    agendaDocList.push(this.pdfService.getPageBreak());
                } else if (agendaItemIndex < agendaItems.length - 1 && !enforcePageBreaks) {
                    agendaDocList.push(this.getDivLine());
                }
            } catch (err) {
                const errorText = `${this.translate.instant(`Error during PDF creation of agenda item:`)} ${
                    agendaItems[agendaItemIndex].item_number
                }`;
                console.error(`${errorText}\nDebugInfo:\n`, err);
                throw new PdfError(errorText);
            }
        }

        if (agendaItems.length > 1 && printToc) {
            // doc.push(this.createToc(agendaItems));
            // TODO: add toc
            console.log(`XXX create Toc`);
        }

        doc = doc.concat(agendaDocList);

        return doc;
    }

    private agendaItemToDoc(agendaItem: ViewAgendaItem, info: any, _meta: any): Content[] {
        const agendaItemDoc = [];
        if (info.includes(`title`) || info.includes(`item_number`)) {
            agendaItemDoc.push(...this.createNumberTitleDoc(agendaItem, info));
        }
        if (info.includes(`text`)) {
            agendaItemDoc.push(...this.createTextDoc(agendaItem));
        }
        if (info.includes(`moderation_notes`)) {
            agendaItemDoc.push(...this.createModerationNotesDoc(agendaItem));
        }
        if (info.includes(`list_of_speakers`)) {
            agendaItemDoc.push(...this.createListOfSpeakersDoc(agendaItem));
        }
        if (info.includes(`polls`)) {
            agendaItemDoc.push(...this.createPollsDoc(agendaItem));
        }
        if (info.includes(`internal_commentary`)) {
            agendaItemDoc.push(...this.createCommentDoc(agendaItem));
        }
        if (info.includes(`attachments`)) {
            agendaItemDoc.push(...this.createAttachmentsDoc(agendaItem));
        }
        return agendaItemDoc;
    }

    private createNumberTitleDoc(agendaItem: ViewAgendaItem, info: any): Content[] {
        const useItemNumber = info.includes(`item_number`);
        const useTitle = info.includes(`title`);
        let numberOrTitle = ``;
        if (useItemNumber && useTitle) {
            numberOrTitle = (agendaItem.item_number + `: ` || ``) + agendaItem.content_object!.getTitle();
        } else if (useItemNumber) {
            numberOrTitle = agendaItem.item_number || ``;
        } else if (useTitle) {
            numberOrTitle = agendaItem.content_object!.getTitle();
        }

        const entry = {
            style: this.getStyle(`header1`),
            columns: [
                {
                    text: numberOrTitle
                }
            ]
        };
        return [entry];
    }

    private createTextDoc(agendaItem: ViewAgendaItem): Content[] {
        if (agendaItem.content_object?.getCSVExportText) {
            const entry = this.htmlToPdfService.convertHtml({ htmlText: agendaItem.content_object?.text ?? `` });
            return [entry];
        }
        return [];
    }

    private createAttachmentsDoc(agendaItem: ViewAgendaItem): Content[] {
        // TODO add complete url as link
        const attachments = agendaItem.content_object?.attachment_meeting_mediafiles ?? [];
        const entries = attachments.map(a => {
            return { text: `${a.url}` };
        });
        if (entries.length) {
            return [{ text: this.translate.instant(`Attachments`), style: this.getStyle(`header2`) }, ...entries];
        }
        return [];
    }

    private createModerationNotesDoc(agendaItem: ViewAgendaItem): Content[] {
        const moderationNotes = agendaItem.content_object?.list_of_speakers?.moderator_notes ?? ``;
        const entry = this.htmlToPdfService.convertHtml({ htmlText: moderationNotes });
        if (moderationNotes) {
            return [{ text: this.translate.instant(`Moderation note`), style: this.getStyle(`header2`) }, entry];
        } else {
            return [];
        }
    }

    private createListOfSpeakersDoc(_agendaItem: ViewAgendaItem): Content[] {
        // TODO add los component
        return [{ text: this.translate.instant(`List of Speakers`), style: this.getStyle(`header2`) }];
    }

    private createPollsDoc(_agendaItem: ViewAgendaItem): Content[] {
        // TODO add polls part of AgendaItemExport
        return [{ text: this.translate.instant(`Polls`), style: this.getStyle(`header2`) }];
    }

    private createCommentDoc(agendaItem: ViewAgendaItem): Content[] {
        return [
            { text: this.translate.instant(`Internal Commentary`), style: this.getStyle(`header2`) },
            { text: agendaItem.comment ?? `` }
        ];
    }

    private getStyle(name: string): any {
        switch (name) {
            case `header1`:
                return { bold: true, fontSize: 14 };
            case `header2`:
                return { bold: true, fontSize: 12 };
            default:
                return {};
        }
    }

    private getDivLine(): Content[] {
        return [
            {
                text: ``,
                marginTop: 5
            },
            {
                canvas: [
                    {
                        type: `line`,
                        lineWidth: 2,
                        x1: 0,
                        y1: 0,
                        x2: 500,
                        y2: 0
                    }
                ]
            },
            {
                text: ``,
                marginTop: 5
            }
        ];
    }
}
