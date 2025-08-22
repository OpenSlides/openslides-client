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

        // doc.push(this.pdfService.createTitle(this.translate.instant(`Agenda`)));
        doc.push([
            {
                text: this.translate.instant(`Agenda`),
                style: this.getStyle(`header1`),
                margin: [0, 0, 0, 20]
            }
        ]);
        // doc.push(this.getDivLine());

        if (printToc) {
            // TODO: add toc
            console.log(`XXX create Toc`);
            // doc.push(this.createToc(agendaItems));
        }

        doc = doc.concat(agendaDocList);

        console.log(`End of creation`);

        return doc;
    }

    /**
     * Creates the table of contents for the agenda.
     * Considers sorting by categories and no sorting.
     *
     * @param motions The motions to add in the TOC
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
        for (const topic of agenda) {
            tocBody.push(
                /**
                this.pdfService.createTocLine({
                    identifier: `${topic.item_number ? topic.item_number : ``}`,
                    title: topic.getTitle(),
                    pageReference: `${topic.id}`
                })
                */
                this.pdfService.createTocLine({
                    identifier: `${topic.item_number ? topic.item_number : ``}`,
                    title: topic.getTitle(),
                    pageReference: `${topic.id}`,
                    style: StyleType.DEFAULT
                })
            );
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
     * Function to get the definition for the header
     * for exporting motion-list as PDF. Needed, if submitters
     * and recommendation should also be exported to the `Table of contents`.
     *
     * @returns {Content} The DocDefinition for `pdfmake.js`.
     */
    private getTocHeaderDefinition(): Content {
        return [
            { text: this.translate.instant(`Number`), style: `tocHeaderRow` },
            {
                style: `tocHeaderRow`,
                text: [
                    `${this.translate.instant(`Title`)} · ${this.translate.instant(`Submitters`)} · `,
                    { text: `${this.translate.instant(`Recommendation`)}`, italics: true }
                ]
            },
            { text: this.translate.instant(`Page`), style: `tocHeaderRow`, alignment: `right` }
        ];
    }

    private agendaItemToDoc(agendaItem: ViewAgendaItem, info: any, _meta: any): Content {
        const agendaItemDoc: any[] = [];
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

    private createNumberTitleDoc(agendaItem: ViewAgendaItem, info: any): ContentText {
        const useItemNumber: boolean = info.includes(`item_number`);
        const useTitle: boolean = info.includes(`title`);
        const itemNumber: string = agendaItem.item_number ?? ``;
        const title: string = agendaItem.content_object!.getTitle();
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
            style: this.getStyle(`header2`),
            // style: title,
            text: numberOrTitle
        };
    }

    private createTextDoc(agendaItem: ViewAgendaItem): Content {
        if (agendaItem.content_object?.getCSVExportText) {
            const entry = this.htmlToPdfService.convertHtml({ htmlText: agendaItem.content_object?.text ?? `` });
            return entry;
        }
        return [];
    }

    private createModerationNotesDoc(agendaItem: ViewAgendaItem): Content[] {
        const moderationNotes = agendaItem.content_object?.list_of_speakers?.moderator_notes ?? ``;
        const entry = this.htmlToPdfService.convertHtml({ htmlText: moderationNotes });
        if (moderationNotes) {
            return [
                {
                    text: this.translate.instant(`Moderation note`),
                    style: this.getStyle(`header3`),
                    margin: [0, 10, 0, 0]
                },
                entry
            ];
        } else {
            return [];
        }
    }

    private createListOfSpeakersDoc(agendaItem: ViewAgendaItem): Content[] {
        // TODO this needs to be finished, table display and missing fields.
        const entries: Content[] = [];
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
        entries.push({
            style: this.getStyle(`table-header`),
            columns: [
                { text: this.translate.instant(`Speaker`), width: 180 },
                { text: this.translate.instant(`Structure level`), width: 110 },
                { text: this.translate.instant(`State`), width: 65 },
                { text: this.translate.instant(`Start time`), width: 110 },
                { text: this.translate.instant(`Duration`), width: 50 }
            ]
        });
        // separate line
        entries.push({
            style: { color: `lightgrey` },
            canvas: [
                {
                    type: `line`,
                    lineWidth: 0.5,
                    x1: 0,
                    y1: 0,
                    x2: 500,
                    y2: 0
                }
            ]
        });

        // first finished speakers (sorted)
        let i = 1;
        for (const speaker of finishedSpeakers) {
            const state = speaker.speech_state ? this.translate.instant(speaker.speech_state) : ``;
            const style = (i + 1) % 2 ? this.getStyle(`grey`) : {};
            entries.push({
                style: style,
                columns: [
                    { text: `${i}. ${speaker.name}`, width: 180 },
                    { text: speaker.meeting_user.structure_levels?.map(stlvl => stlvl.name).join(','), width: 110 },
                    { text: state, width: 65 },
                    {
                        text: speaker.getBeginTimeAsDate()!.toLocaleString(this.translate.currentLang),
                        width: 110
                    },
                    { text: this.durationService.durationToString(speaker.speakingTime, `m`), width: 50 }
                ]
            });
            i++;
        }
        // second rest of the speakers
        for (const speaker of speakers.filter(sp => !sp.isFinished)) {
            const state = speaker.speech_state ? this.translate.instant(speaker.speech_state) : ``;
            const style = (i + 1) % 2 ? this.getStyle(`grey`) : {};
            entries.push({
                style: style,
                columns: [
                    { text: `${i}. ${speaker.name}`, width: 180 },
                    { text: speaker.meeting_user.structure_levels?.map(stlvl => stlvl.name).join(','), width: 110 },
                    { text: state, width: 65 },
                    { text: ``, width: 110 },
                    { text: ``, width: 50 }
                ]
            });
            i++;
        }

        if (speakers.length > 0) {
            return [
                {
                    text: this.translate.instant(`List of speakers`),
                    style: this.getStyle(`header3`),
                    margin: [0, 0, 0, 10]
                },
                ...entries
            ];
        }
        return [];
    }

    private createPollsDoc(agendaItem: ViewAgendaItem): Content[] {
        const entries: Content[] = [];

        const optionWidth = 280;
        const votesWidth = 120;
        const firstPlaceWidth = 10;

        if (agendaItem.content_object?.poll_ids) {
            for (let i = 0; i < agendaItem.content_object?.polls.length; i++) {
                const poll: ViewPoll = agendaItem.content_object?.polls[i];
                entries.push({ text: poll.title, style: this.getStyle(`header3`), margin: [0, 0, 0, 5] });
                entries.push({
                    style: this.getStyle(`table-header`),
                    columns: [
                        { text: ``, width: firstPlaceWidth },
                        { text: this.translate.instant(`Options`), width: optionWidth },
                        { text: this.translate.instant(`Votes`), width: votesWidth }
                    ]
                });
                // separate line
                entries.push({
                    style: { color: `lightgrey` },
                    canvas: [
                        {
                            type: `line`,
                            lineWidth: 0.5,
                            x1: 0,
                            y1: 0,
                            x2: 500,
                            y2: 0
                        }
                    ]
                });

                for (const option of poll.options) {
                    const style = (i + 1) % 2 ? this.getStyle(`grey`) : {};
                    console.log(option);
                    console.log(option.votes);
                    // TODO: The rsult is missing

                    entries.push({
                        style: style,
                        columns: [
                            { text: i, width: firstPlaceWidth },
                            { text: option.getOptionTitle().title, width: optionWidth },
                            { text: ``, width: votesWidth }
                        ]
                    });
                    i++;
                }
                const amount: string = poll.votesvalid ? String(poll.votesvalid) : ``;
                entries.push({
                    columns: [
                        { text: ``, width: firstPlaceWidth },
                        { text: this.translate.instant(`Cast votes`), width: optionWidth },
                        { text: amount, width: votesWidth }
                    ],
                    margin: [0, 0, 0, 10]
                });
                entries.push({ text: ``, margin: [0, 0, 0, 10] });
            }
            return [
                { text: this.translate.instant(`Polls`), style: this.getStyle(`header3`), margin: [0, 0, 0, 10] },
                ...entries
            ];
        }
        return [];
    }

    private createCommentDoc(agendaItem: ViewAgendaItem): Content[] {
        if (agendaItem.comment) {
            return [
                {
                    text: this.translate.instant(`Internal Commentary`),
                    style: this.getStyle(`header3`),
                    margin: [0, 10, 0, 10]
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
            case `table-header`:
                return { bold: true, fontSize: 12 };
            case `grey`:
                return { color: `grey` };
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

        if (agendaItem.content_object?.attachment_meeting_mediafiles.length > 0) {
            attachments.push({
                text: this.translate.instant(`Attachments`),
                style: this.getStyle(`header3`),
                margin: [0, 0, 0, 10]
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
        }

        return attachments;
    }
}
