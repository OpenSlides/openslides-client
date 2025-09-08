import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Content, ContentText } from 'pdfmake/interfaces';
import { HtmlToPdfService } from 'src/app/gateways/export/html-to-pdf.service';
import { BorderType, PdfError, StyleType } from 'src/app/gateways/export/pdf-document.service';
import { PdfImagesService } from 'src/app/gateways/export/pdf-document.service/pdf-images.service';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { DurationService } from 'src/app/site/services/duration.service';

import { MeetingPdfExportService } from '../../../../services/export';
import { ViewPoll } from '../../../polls';
import { ViewSpeaker } from '../../modules/list-of-speakers/view-models/view-speaker';
import { ViewTopic } from '../../modules/topics/view-models';
import { ViewAgendaItem } from '../../view-models';
import { AgendaItemCommonServiceModule } from '../agenda-item-common-service.module';

const PDF_A4_POINTS_WIDTH = 595.296;
const PDF_A5_POINTS_WIDTH = 419.544;
const TABLEROW_GREY = '#eeeeee';

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
    private displayedAgendaItemIds = [];

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
        this.displayedAgendaItemIds = agendaItems.map(view => view.id);
        let doc: Content = [];
        const agendaDocList = [];
        const printToc = pdfMeta?.includes(AGENDA_PDF_OPTIONS.Toc);
        const enforcePageBreaks = pdfMeta?.includes(AGENDA_PDF_OPTIONS.AddBreaks);

        for (let agendaItemIndex = 0; agendaItemIndex < agendaItems.length; ++agendaItemIndex) {
            try {
                const agendaDocDef: any = this.agendaItemToDoc(agendaItems[agendaItemIndex], exportInfo, pdfMeta);

                // add id field to the first page of a motion to make it findable over TOC
                agendaDocDef[0].id = `${agendaItems[agendaItemIndex].id}`;

                agendaDocList.push(agendaDocDef);

                if (agendaItemIndex < agendaItems.length - 1 && enforcePageBreaks) {
                    agendaDocList.push(this.pdfService.getPageBreak());
                }
            } catch (err) {
                const errorText = `${this.translate.instant(`Error during PDF creation of agenda item:`)} ${
                    agendaItems[agendaItemIndex].item_number
                }`;
                console.error(`${errorText}\nDebugInfo:\n`, err);
                throw new PdfError(errorText);
            }
        }

        doc.push([
            {
                text: this.translate.instant(`Agenda`),
                style: this.getStyle(`header1`),
                margin: this.getStyle(`margin-header1`)
            }
        ]);

        if (printToc) {
            doc.push(this.createToc(agendaItems));
        }

        doc = doc.concat(agendaDocList);

        return doc;
    }

    /**
     * Creates the table of contents for the agenda.
     *
     * @param agenda The agenda items for the table of content
     * @returns the table of contents as document definition
     */
    private createToc(agenda: ViewAgendaItem[]): Content {
        const toc = [];

        // Initialize the header and the layout for border-style.
        const header = this.getTocHeaderDefinition();
        const layout = BorderType.LIGHT_HORIZONTAL_LINES;
        // Create the toc title
        const tocTitle = {
            text: this.translate.instant(`Table of contents`),
            style: `heading2`
        };

        // all agenda in the same table
        const tocBody = [];
        let i = 1;
        for (const topic of agenda) {
            tocBody.push(
                this.pdfService.createTocLine({
                    identifier: `${topic.item_number ? topic.item_number : ``}`,
                    title: topic.content_object?.title,
                    pageReference: `${topic.id}`,
                    style: StyleType.DEFAULT,
                    fillColor: (i + 1) % 2 ? TABLEROW_GREY : undefined
                })
            );
            i++;
        }
        toc.push(
            this.pdfService.createTocTableDef(
                { tocBody, style: StyleType.CATEGORY_SECTION, borderStyle: layout },
                header
            )
        );

        return [tocTitle, toc, this.pdfService.getPageBreak()];
    }

    /**
     * Function to get the definition for the header of the ToC
     * for exporting agenda as PDF.
     *
     * @returns {Content} The DocDefinition for `pdfmake.js`.
     */
    private getTocHeaderDefinition(): Content {
        return [
            { text: this.translate.instant(`Number`), style: `tocHeaderRow` },
            {
                style: `tocHeaderRow`,
                text: [`${this.translate.instant(`Title`)}`]
            },
            { text: this.translate.instant(`Page`), style: `tocHeaderRow`, alignment: `right` }
        ];
    }

    private agendaItemToDoc(agendaItem: ViewAgendaItem, info: any, meta: any): Content {
        const agendaItemDoc: any[] = [];
        const enforcePageBreaks = meta?.includes(AGENDA_PDF_OPTIONS.AddBreaks);
        agendaItemDoc.push(this.getParentItems(agendaItem, info, enforcePageBreaks));

        if (info.includes(`title`) || info.includes(`item_number`)) {
            agendaItemDoc.push(this.createNumberTitleDoc(agendaItem, info));
        }
        if (info.includes(`text`)) {
            agendaItemDoc.push(this.createTextDoc(agendaItem));
        }
        if (info.includes(`moderation_notes`)) {
            agendaItemDoc.push(this.createModerationNotesDoc(agendaItem));
        }
        if (info.includes(`polls`)) {
            agendaItemDoc.push(this.createPollsDoc(agendaItem));
        }
        if (info.includes(`list_of_speakers`)) {
            agendaItemDoc.push(this.createListOfSpeakersDoc(agendaItem));
        }
        if (info.includes(`internal_commentary`)) {
            agendaItemDoc.push(this.createCommentDoc(agendaItem));
        }
        if (info.includes(`attachments`)) {
            agendaItemDoc.push(this.createAttachmentsDoc(agendaItem));
        }
        return agendaItemDoc;
    }

    // display the parent items, if they are not in the exported items
    private getParentItems(agendaItem: ViewAgendaItem, info: any, enforcePageBreaks: boolean): Content[] {
        const parent = agendaItem.parent;
        const entries = [];
        if (parent) {
            if (!this.displayedAgendaItemIds.includes(parent.id)) {
                entries.push(...this.getParentItems(parent, info, enforcePageBreaks));
                entries.push(this.createNumberTitleDoc(parent, info), this.createTextDoc(parent));
                this.displayedAgendaItemIds.push(parent.id);
            }
            if (!enforcePageBreaks) {
                entries.push(this.getDivLine(0.5));
            }
        } else {
            if (!enforcePageBreaks) {
                entries.push(this.getDivLine());
            }
        }
        return entries;
    }

    private createNumberTitleDoc(agendaItem: ViewAgendaItem, info: any): ContentText {
        const useItemNumber: boolean = info.includes(`item_number`);
        const useTitle: boolean = info.includes(`title`);
        const itemNumber: string = agendaItem.item_number ?? ``;
        const title: string = agendaItem.content_object!.getTitle();
        const styleName = agendaItem.level ? `header-child` : `header2`;
        let numberOrTitle = ``;
        console.log();
        if (useItemNumber && itemNumber && useTitle) {
            numberOrTitle = `${itemNumber}: ${title}`;
        } else if (useItemNumber && itemNumber) {
            numberOrTitle = itemNumber;
        } else if (useTitle) {
            numberOrTitle = title;
        }

        return {
            style: this.getStyle(styleName),
            text: numberOrTitle
        };
    }

    private createTextDoc(agendaItem: ViewAgendaItem): Content {
        if (!this.isTopic(agendaItem.content_object)) {
            return [];
        }
        if (agendaItem.content_object?.getCSVExportText) {
            const entry = this.htmlToPdfService.convertHtml({ htmlText: agendaItem.content_object?.text ?? `` });
            return entry;
        }
        return [];
    }

    private createModerationNotesDoc(agendaItem: ViewAgendaItem): Content[] {
        if (!this.isTopic(agendaItem.content_object)) {
            return [];
        }
        const moderationNotes = agendaItem.content_object?.list_of_speakers?.moderator_notes ?? ``;
        const entry = this.htmlToPdfService.convertHtml({ htmlText: moderationNotes });
        if (moderationNotes) {
            return [
                {
                    text: this.translate.instant(`Moderation note`),
                    style: this.getStyle(`header3`),
                    margin: this.getStyle(`margin-header3`)
                },
                entry
            ];
        } else {
            return [];
        }
    }

    private createListOfSpeakersDoc(agendaItem: ViewAgendaItem): Content[] {
        if (!this.isTopic(agendaItem.content_object)) {
            return [];
        }
        const tableCells: Content[][] = [];
        const finishedSpeakers: ViewSpeaker[] = agendaItem.content_object?.list_of_speakers.finishedSpeakers ?? [];
        const speakers: ViewSpeaker[] = agendaItem.content_object.list_of_speakers.speakers;
        finishedSpeakers.sort((a: ViewSpeaker, b: ViewSpeaker) => {
            const aTime = new Date(a.end_time).getTime();
            const bTime = new Date(b.end_time).getTime();
            if (aTime === bTime) {
                return a.weight - b.weight;
            }
            return aTime - bTime;
        });
        // table header
        tableCells.push([
            { text: this.translate.instant(`Speaker`), style: `tocHeaderRow` },
            { text: this.translate.instant(`Structure level`), style: `tocHeaderRow` },
            { text: this.translate.instant(`State`), style: `tocHeaderRow` },
            { text: this.translate.instant(`Start time`), style: `tocHeaderRow` },
            { text: this.translate.instant(`Duration`), style: `tocHeaderRow` }
        ]);

        // first finished speakers (sorted)
        let i = 1;
        for (const speaker of finishedSpeakers) {
            const state = speaker.speech_state ? this.translate.instant(speaker.speech_state) : ``;
            const backgroundColor = (i + 1) % 2 ? TABLEROW_GREY : ``;
            tableCells.push([
                { text: `${i}. ${speaker.user_short_name}`, fillColor: backgroundColor },
                {
                    text: speaker.meeting_user.structure_levels?.map(stlvl => stlvl.name).join(', '),
                    fillColor: backgroundColor
                },
                { text: state, fillColor: backgroundColor },
                {
                    text: speaker.getBeginTimeAsDate()!.toLocaleString(this.translate.currentLang),
                    fillColor: backgroundColor
                },
                { text: this.durationService.durationToString(speaker.speakingTime, `m`), fillColor: backgroundColor }
            ]);
            i++;
        }
        // second rest of the speakers
        for (const speaker of speakers.filter(sp => !sp.isFinished)) {
            const state = speaker.speech_state ? this.translate.instant(speaker.speech_state) : ``;
            const backgroundColor = (i + 1) % 2 ? TABLEROW_GREY : ``;
            tableCells.push([
                { text: `${i}. ${speaker.user_short_name}`, fillColor: backgroundColor },
                {
                    text: speaker.meeting_user.structure_levels?.map(stlvl => stlvl.name).join(', '),
                    fillColor: backgroundColor
                },
                { text: state, fillColor: backgroundColor },
                { text: ``, fillColor: backgroundColor },
                { text: ``, fillColor: backgroundColor }
            ]);
            i++;
        }

        if (speakers.length > 0) {
            return [
                {
                    text: this.translate.instant(`List of speakers`),
                    style: this.getStyle(`header3`),
                    margin: this.getStyle(`margin-header3`)
                },
                {
                    table: {
                        headerRows: 1,
                        keepWithHeaderRows: 1,
                        dontBreakRows: true,
                        widths: [140, 60, 65, 110, 50],
                        body: tableCells
                    },
                    layout: BorderType.LIGHT_HORIZONTAL_LINES,
                    margin: this.getStyle(`margin-text`)
                }
            ];
        }
        return [];
    }

    private createPollsDoc(agendaItem: ViewAgendaItem): Content[] {
        if (!this.isTopic(agendaItem.content_object)) {
            return [];
        }
        const entries: Content[] = [];

        const optionWidth = 200;
        const votesWidth = 200;
        const firstPlaceWidth = 10;

        if (agendaItem.content_object?.polls.length) {
            for (let pollIndex = 0; pollIndex < agendaItem.content_object?.polls.length; pollIndex++) {
                const poll: ViewPoll = agendaItem.content_object?.polls[pollIndex];
                const tableCells: Content[][] = [];
                entries.push({
                    text: poll.title,
                    style: this.getStyle(`header3`),
                    margin: this.getStyle(`margin-item`)
                });
                // poll table header
                tableCells.push([
                    { text: `` },
                    { text: this.translate.instant(`Options`), style: `tocHeaderRow` },
                    { text: this.translate.instant(`Votes`), style: `tocHeaderRow` }
                ]);
                // poll table rows
                let optionIndex = 0;
                for (const option of poll.options) {
                    const votesForOption = poll.stateHasVotes ? option.votes.length : ``;
                    const backgroundColor = optionIndex % 2 ? TABLEROW_GREY : undefined;
                    tableCells.push([
                        { text: optionIndex + 1, fillColor: backgroundColor },
                        { text: option.getOptionTitle().title, fillColor: backgroundColor },
                        { text: `${votesForOption}`, fillColor: backgroundColor }
                    ]);
                    optionIndex++;
                }
                // poll table valid votes line
                const amount: string = poll.votesvalid ? String(poll.votesvalid) : ``;
                tableCells.push([
                    { text: ``, width: firstPlaceWidth },
                    { text: this.translate.instant(`Valid votes`) },
                    { text: amount, width: votesWidth }
                ]);

                // table configuration
                entries.push({
                    table: {
                        headerRows: 1,
                        keepWithHeaderRows: 1,
                        dontBreakRows: true,
                        widths: [firstPlaceWidth, optionWidth, votesWidth],
                        body: tableCells
                    },
                    layout: BorderType.LIGHT_HORIZONTAL_LINES,
                    margin: this.getStyle(`margin-text`)
                });

                entries.push({ text: ``, margin: this.getStyle(`margin-text`) });
            }
            return [
                {
                    text: this.translate.instant(`Polls`),
                    style: this.getStyle(`header3`),
                    margin: this.getStyle(`margin-header3`)
                },
                ...entries
            ];
        }
        return [];
    }

    private createCommentDoc(agendaItem: ViewAgendaItem): Content[] {
        if (!this.isTopic(agendaItem.content_object)) {
            return [];
        }
        if (agendaItem.comment) {
            return [
                {
                    text: this.translate.instant(`Internal Commentary`),
                    style: this.getStyle(`header3`),
                    margin: this.getStyle(`margin-header3`)
                },
                { text: agendaItem.comment }
            ];
        }
        return [];
    }

    private getStyle(name: string): any {
        switch (name) {
            case `header1`:
                return { bold: true, fontSize: 24 };
            case `header2`:
                return { bold: true, fontSize: 20 };
            case `header3`:
                return { bold: true, fontSize: 14 };
            case `header-child`:
                return { bold: true, fontSize: 16 };
            case `table-header`:
                return { bold: true, fontSize: 12 };
            case `grey`:
                return { layout: TABLEROW_GREY };
            case `margin-header1`:
                return [0, 0, 0, 20];
            case `margin-header3`:
                return [0, 15, 0, 10];
            case `margin-type-text`:
                return [0, 0, 0, 10];
            case `margin-item`:
                return [0, 0, 0, 5];
            default:
                return {};
        }
    }

    private getDivLine(lineWidth?: number): Content[] {
        return [
            {
                text: ``,
                marginTop: 5
            },
            {
                canvas: [
                    {
                        type: `line`,
                        lineWidth: lineWidth ?? 2,
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
        if (!this.isTopic(agendaItem.content_object)) {
            return [];
        }
        let width = this.pdfService.pageSize === `A5` ? PDF_A5_POINTS_WIDTH : PDF_A4_POINTS_WIDTH;
        width = (width - this.pdfService.pageMarginPointsLeft - this.pdfService.pageMarginPointsRight) / 4;
        const instanceUrl = this.organizationSettingsService.instant(`url`);

        const attachments = [];

        if (agendaItem.content_object?.attachment_meeting_mediafiles.length > 0) {
            attachments.push({
                text: this.translate.instant(`Attachments`),
                style: this.getStyle(`header3`),
                margin: this.getStyle(`margin-header3`)
            });
            for (const key of Object.keys(agendaItem.content_object?.attachment_meeting_mediafiles)) {
                const attachment = agendaItem.content_object?.attachment_meeting_mediafiles[key];
                const fileUrl = attachment.getDetailStateUrl();
                if (this.pdfImagesService.isImageUsableForPdf(attachment.mediafile.mimetype)) {
                    this.pdfImagesService.addImageUrl(fileUrl);
                    attachments.push({
                        image: fileUrl,
                        width: width,
                        margin: this.getStyle(`margin-text`)
                    });
                } else {
                    const link = Location.joinWithSlash(instanceUrl, fileUrl);
                    attachments.push({
                        ul: [
                            {
                                text: attachment.getTitle() + `: ` + link,
                                link: link,
                                margin: this.getStyle(`margin-item`)
                            }
                        ]
                    });
                }
            }
        }

        return attachments;
    }

    private isTopic(obj: any): obj is ViewTopic {
        const topic = obj as ViewTopic;
        return !!topic && topic.collection !== undefined && topic.collection === ViewTopic.COLLECTION && !!topic.topic;
    }
}
