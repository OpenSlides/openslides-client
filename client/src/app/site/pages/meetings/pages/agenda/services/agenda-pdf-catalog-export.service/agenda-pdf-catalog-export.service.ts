import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Content } from 'pdfmake/interfaces';
import { HtmlToPdfService } from 'src/app/gateways/export/html-to-pdf.service';
import { PdfError } from 'src/app/gateways/export/pdf-document.service';
import { PdfImagesService } from 'src/app/gateways/export/pdf-document.service/pdf-images.service';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { DurationService } from 'src/app/site/services/duration.service';

import { MeetingPdfExportService } from '../../../../services/export';
import { ViewSpeaker } from '../../modules/list-of-speakers/view-models/view-speaker';
import { ViewAgendaItem } from '../../view-models';
import { AgendaItemCommonServiceModule } from '../agenda-item-common-service.module';

const PDF_A4_POINTS_WIDTH = 595.296;
const PDF_A5_POINTS_WIDTH = 419.544;

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
        private htmlToPdfService: HtmlToPdfService,
        private organizationSettingsService: OrganizationSettingsService,
        private pdfImagesService: PdfImagesService,
        private durationService: DurationService
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
        if (info.includes(`last_speakers`)) {
            agendaItemDoc.push(...this.createLastSpeakersDoc(agendaItem));
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
            const itemNumber = agendaItem.item_number ?? ``;
            const title = agendaItem.content_object!.getTitle();
            if (itemNumber) {
                numberOrTitle = `${itemNumber}: ${title}`;
            } else {
                numberOrTitle = title;
            }
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

    private createModerationNotesDoc(agendaItem: ViewAgendaItem): Content[] {
        const moderationNotes = agendaItem.content_object?.list_of_speakers?.moderator_notes ?? ``;
        const entry = this.htmlToPdfService.convertHtml({ htmlText: moderationNotes });
        if (moderationNotes) {
            return [{ text: this.translate.instant(`Moderation note`), style: this.getStyle(`header2`) }, entry];
        } else {
            return [];
        }
    }

    private createListOfSpeakersDoc(agendaItem: ViewAgendaItem): Content[] {
        // TODO add los component
        const entries = [];
        let i = 1;
        for (const speaker of agendaItem.content_object?.list_of_speakers.speakers ?? []) {
            entries.push({ text: `${i}. ${speaker.name}` });
            i++;
        }
        return [{ text: this.translate.instant(`List of speakers`), style: this.getStyle(`header2`) }, ...entries];
    }

    private createLastSpeakersDoc(agendaItem: ViewAgendaItem): Content[] {
        // TODO this needs to be finished, table display and missing fields.
        const entries = [];
        const finishedSpeakers = agendaItem.content_object?.list_of_speakers.finishedSpeakers ?? [];
        finishedSpeakers.sort((a: ViewSpeaker, b: ViewSpeaker) => {
            const aTime = new Date(a.end_time).getTime();
            const bTime = new Date(b.end_time).getTime();
            if (aTime === bTime) {
                return a.weight - b.weight;
            }
            return aTime - bTime;
        });
        let i = 1;
        for (const speaker of finishedSpeakers) {
            entries.push({
                columns: [
                    { text: `${i}. ${speaker.name}`, width: 180 },
                    // TODO add structure level
                    // { text: speaker.getLOSStructureLevels(true), width: 60 },
                    // TODO add speaker state
                    { text: speaker.getBeginTimeAsDate()!.toLocaleString(this.translate.currentLang), width: 110 },
                    { text: this.durationService.durationToString(speaker.speakingTime, `m`), width: 30 }
                ]
            });
            i++;
        }
        return [{ text: this.translate.instant(`Last speakers`), style: this.getStyle(`header2`) }, ...entries];
    }

    private createPollsDoc(_agendaItem: ViewAgendaItem): Content[] {
        // TODO add polls part from motion export(?)
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

    private createAttachmentsDoc(agendaItem: ViewAgendaItem): Content[] {
        let width = this.pdfService.pageSize === `A5` ? PDF_A5_POINTS_WIDTH : PDF_A4_POINTS_WIDTH;
        width = (width - this.pdfService.pageMarginPointsLeft - this.pdfService.pageMarginPointsRight) / 4;
        const instanceUrl = this.organizationSettingsService.instant(`url`);

        const attachments = [];
        attachments.push({
            text: this.translate.instant(`Attachments`),
            style: this.getStyle(`header2`),
            margin: [0, 10, 0, 10]
        });

        for (const key of Object.keys(agendaItem.content_object?.attachment_meeting_mediafiles)) {
            const attachment = agendaItem.content_object?.attachment_meeting_mediafiles[key];
            const fileUrl = attachment.getDetailStateUrl();
            if (this.pdfImagesService.isImageUsableForPdf(attachment.mediafile.mimetype)) {
                this.pdfImagesService.addImageUrl(fileUrl);
                attachments.push({
                    image: fileUrl,
                    width: width,
                    margin: [0, 0, 0, 10]
                });
            } else {
                const link = Location.joinWithSlash(instanceUrl, fileUrl);
                attachments.push({
                    ul: [
                        {
                            text: attachment.getTitle() + `: ` + link,
                            link: link,
                            margin: [0, 0, 0, 5]
                        }
                    ]
                });
            }
        }

        return attachments;
    }
}
