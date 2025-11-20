import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Content, ContentText, TableCell } from 'pdfmake/interfaces';
import { HtmlToPdfService } from 'src/app/gateways/export/html-to-pdf.service';
import { BorderType, PdfError, StyleType } from 'src/app/gateways/export/pdf-document.service';
import { PdfImagesService } from 'src/app/gateways/export/pdf-document.service/pdf-images.service';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { DurationService } from 'src/app/site/services/duration.service';
import { TreeService } from 'src/app/ui/modules/sorting/modules/sorting-tree/services';

import { MeetingPdfExportService } from '../../../../services/export';
import { MeetingSettingsService } from '../../../../services/meeting-settings.service';
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
    // parent agenda items which are not in the export are handled different
    // then exported agenda items, collect the ids of the special parent items here
    private addedAgendaItemIds = [];
    private _addExtraSpace = false;

    public constructor(
        private translate: TranslateService,
        private pdfService: MeetingPdfExportService,
        private htmlToPdfService: HtmlToPdfService,
        private organizationSettingsService: OrganizationSettingsService,
        private meetingSettingsService: MeetingSettingsService,
        private pdfImagesService: PdfImagesService,
        private durationService: DurationService,
        private treeService: TreeService
    ) {}

    /**
     * Converts the list of agenda items to pdfmake doc definition.
     * Public entry point to conversion of multiple agenda items.
     *
     * @param sortedAgendaItems the list of view agendaItem to convert
     * @param info
     * @param pdfMeta
     * @returns pdfmake doc definition as object
     */
    public agendaListToDocDef(agendaItems: ViewAgendaItem[], exportInfo: any, pdfMeta: string[]): Content {
        const addedAgendaItems = this.getMissingAgendaItems(agendaItems);
        this.addedAgendaItemIds = addedAgendaItems.map(item => item.id);
        const tree = this.treeService.makeSortedTree(agendaItems.concat(addedAgendaItems), `weight`, `parent_id`);
        const sortedAgendaItems = this.treeService.getFlatItemsFromTree(tree);
        let doc: Content = [];
        const agendaDocList = [];
        const printToc = pdfMeta?.includes(AGENDA_PDF_OPTIONS.Toc);
        const enforcePageBreaks = pdfMeta?.includes(AGENDA_PDF_OPTIONS.AddBreaks);

        for (let agendaItemIndex = 0; agendaItemIndex < sortedAgendaItems.length; ++agendaItemIndex) {
            try {
                const agendaDocDef: any = this.agendaItemToDoc(sortedAgendaItems[agendaItemIndex], exportInfo);
                // add id field to the first page of a agenda item to make it findable over TOC
                agendaDocDef[0].id = `${sortedAgendaItems[agendaItemIndex].id}`;
                if (!enforcePageBreaks && agendaItemIndex + 1 < sortedAgendaItems.length) {
                    if (!sortedAgendaItems[agendaItemIndex + 1].parent) {
                        agendaDocDef.push({
                            text: ``,
                            marginBottom: this._addExtraSpace ? 25 : 20
                        });
                    } else {
                        agendaDocDef.push({
                            text: ``,
                            marginBottom: this._addExtraSpace ? 15 : 10
                        });
                    }
                    this._addExtraSpace = false;
                }

                agendaDocList.push(agendaDocDef);

                if (agendaItemIndex < sortedAgendaItems.length - 1 && enforcePageBreaks) {
                    agendaDocList.push(this.pdfService.getPageBreak());
                }
            } catch (err) {
                const errorText = `${this.translate.instant(`Error during PDF creation of agenda item:`)} ${
                    sortedAgendaItems[agendaItemIndex].item_number
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

        if (printToc && sortedAgendaItems.length > 1) {
            doc.push(this.createToc(sortedAgendaItems));
        }

        doc = doc.concat(agendaDocList);

        return doc;
    }

    private getMissingAgendaItems(agendaItems: ViewAgendaItem[]): ViewAgendaItem[] {
        const missing = [];
        const missingIds = [];
        const exported = agendaItems.map(item => item.id);
        for (const item of agendaItems) {
            let pivot = item;
            while (pivot.parent) {
                if (!exported.includes(pivot.parent.id) && !missingIds.includes(pivot.parent.id)) {
                    missing.push(pivot.parent);
                    missingIds.push(pivot.parent.id);
                }
                pivot = pivot.parent;
            }
        }
        return missing;
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
            if (!this.addedAgendaItemIds.includes(topic.id)) {
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

    private agendaItemToDoc(agendaItem: ViewAgendaItem, info: any): Content {
        const agendaItemDoc: any[] = [];

        if (info.includes(`title`) || info.includes(`item_number`)) {
            agendaItemDoc.push(this.createNumberTitleDoc(agendaItem, info));
        }
        if (info.includes(`text`)) {
            agendaItemDoc.push(this.createTextDoc(agendaItem));
        }
        if (!this.addedAgendaItemIds.includes(agendaItem.id)) {
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
        }
        return agendaItemDoc;
    }

    private createNumberTitleDoc(agendaItem: ViewAgendaItem, info: any): ContentText {
        const useItemNumber: boolean = info.includes(`item_number`);
        const useTitle: boolean = info.includes(`title`);
        const itemNumber: string = agendaItem.item_number ?? ``;
        const title: string = agendaItem.content_object!.getTitle();
        const styleName = agendaItem.level ? `header-child` : `header2`;
        let numberOrTitle = ``;
        if (agendaItem.content_object?.collection === `motion`) {
            const motion = agendaItem.content_object;
            if (useItemNumber && itemNumber) {
                numberOrTitle = `${itemNumber} `;
            }
            numberOrTitle = numberOrTitle.concat(`${this.translate.instant('Motion')}`);
            if (motion.number) {
                numberOrTitle = numberOrTitle.concat(` ${motion.number}: `);
            } else {
                numberOrTitle = numberOrTitle.concat(`: `);
            }

            numberOrTitle = numberOrTitle.concat(`${motion.title}`);
        } else if (agendaItem.content_object?.collection === `motion_block`) {
            const motionBlock = agendaItem.content_object;
            if (useItemNumber && itemNumber) {
                numberOrTitle = `${itemNumber} `;
            }
            numberOrTitle = numberOrTitle.concat(`${this.translate.instant('Motion block')}: ${motionBlock.title}`);
        } else {
            if (useItemNumber && itemNumber && useTitle) {
                numberOrTitle = `${itemNumber}: ${title}`;
            } else if (useItemNumber && itemNumber) {
                numberOrTitle = itemNumber;
            } else if (useTitle) {
                numberOrTitle = title;
            }
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
            this._addExtraSpace = true;
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
        const tableCells: TableCell[][] = [];
        const finishedSpeakers: ViewSpeaker[] = agendaItem.content_object?.list_of_speakers.finishedSpeakers ?? [];
        const speakers: ViewSpeaker[] = agendaItem.content_object.list_of_speakers.speakers;
        const isA4 = this.pdfService.pageSize === `A4`;
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
            { text: ``, style: `tocHeaderRow` },
            { text: this.translate.instant(`Speaker`), style: `tocHeaderRow` },
            { text: this.translate.instant(`Speaking times`), style: `tocHeaderRow` },
            { text: this.translate.instant(`Start time`), style: `tocHeaderRow` }
        ]);

        // first finished speakers (sorted)
        let i = 1;
        for (const speaker of finishedSpeakers) {
            const state = speaker.speechStateStr ? this.translate.instant(speaker.speechStateStr) : ``;
            const backgroundColor = (i + 1) % 2 ? TABLEROW_GREY : ``;
            const extraBorder: [boolean, boolean, boolean, boolean] = state
                ? [false, true, false, false]
                : [false, true, false, true];
            tableCells.push([
                { border: extraBorder, text: `${i}.`, fillColor: backgroundColor },
                { border: extraBorder, text: speaker.name, fillColor: backgroundColor },
                {
                    border: extraBorder,
                    text: this.durationService.durationToString(speaker.speakingTime, `m`),
                    fillColor: backgroundColor
                },
                {
                    border: extraBorder,
                    text: speaker.getBeginTimeAsDate()!.toLocaleString(this.translate.currentLang),
                    fillColor: backgroundColor
                }
            ]);
            if (state) {
                tableCells.push([
                    { border: [false, false, false, false], text: ``, fillColor: backgroundColor },
                    {
                        border: [false, false, false, false],
                        text: state,
                        fillColor: backgroundColor,
                        style: this.getStyle(`italics`)
                    },
                    { border: [false, false, false, false], text: ``, fillColor: backgroundColor },
                    { border: [false, false, false, false], text: ``, fillColor: backgroundColor }
                ]);
            }
            i++;
        }
        // second rest of the speakers
        for (const speaker of speakers.filter(sp => !sp.isFinished)) {
            const state = speaker.speechStateStr ? this.translate.instant(speaker.speechStateStr) : ``;
            const backgroundColor = (i + 1) % 2 ? TABLEROW_GREY : ``;
            const remainingTimes =
                speaker.isWaiting && speaker.structure_level_list_of_speakers
                    ? this.durationService.durationToString(
                          speaker.structure_level_list_of_speakers.remaining_time,
                          'm'
                      )
                    : ``;
            const extraBorder: [boolean, boolean, boolean, boolean] = state
                ? [false, true, false, false]
                : [false, true, false, true];

            tableCells.push([
                { border: extraBorder, text: `${i}.`, fillColor: backgroundColor },
                { border: extraBorder, text: speaker.name, fillColor: backgroundColor },
                { border: extraBorder, text: remainingTimes, fillColor: backgroundColor },
                { border: extraBorder, text: ``, fillColor: backgroundColor }
            ]);
            if (state) {
                tableCells.push([
                    { border: [false, false, false, false], text: ``, fillColor: backgroundColor },
                    {
                        border: [false, false, false, false],
                        text: state,
                        fillColor: backgroundColor,
                        style: this.getStyle(`italics`)
                    },
                    { border: [false, false, false, false], text: ``, fillColor: backgroundColor },
                    { border: [false, false, false, false], text: ``, fillColor: backgroundColor }
                ]);
            }
            i++;
        }

        if (speakers.length > 0) {
            this._addExtraSpace = true;
            return [
                {
                    text: this.translate.instant(`List of speakers`),
                    style: this.getStyle(`header3`),
                    margin: this.getStyle(`margin-header3`)
                },
                {
                    table: {
                        headerRows: 0,
                        keepWithHeaderRows: 0,
                        dontBreakRows: true,
                        widths: isA4 ? [`auto`, `*`, 50, 110] : [`auto`, `*`, 50, 55],
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
        const isA4 = this.pdfService.pageSize === `A4`;
        const optionWidth = `*`;
        const votesWidth = isA4 ? 200 : 100;
        const firstPlaceWidth = 10;
        const useVoteWeight = this.meetingSettingsService.instant(`users_enable_vote_weight`);

        if (agendaItem.content_object?.polls.length) {
            for (let pollIndex = 0; pollIndex < agendaItem.content_object?.polls.length; pollIndex++) {
                const poll: ViewPoll = agendaItem.content_object?.polls[pollIndex];
                const tableCells: Content[][] = [];
                entries.push({
                    text: poll.title,
                    style: this.getStyle(`header3`),
                    margin: pollIndex === 0 ? this.getStyle(`margin-item`) : this.getStyle(`margin-item-2`)
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
                    let votesForOption: any = ``;
                    if (poll.stateHasVotes && useVoteWeight) {
                        votesForOption = option.votes.map(v => parseFloat(`${v.weight}`)).reduce((a, b) => a + b, 0);
                    } else if (poll.stateHasVotes) {
                        votesForOption = option.votes.length;
                    }
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
                tableCells.push([{ text: `` }, { text: this.translate.instant(`Valid votes`) }, { text: amount }]);

                // table configuration
                entries.push({
                    table: {
                        headerRows: 0,
                        keepWithHeaderRows: 0,
                        dontBreakRows: true,
                        widths: [firstPlaceWidth, optionWidth, votesWidth],
                        body: tableCells
                    },
                    layout: BorderType.LIGHT_HORIZONTAL_LINES,
                    margin: this.getStyle(`margin-text`)
                });

                entries.push({ text: ``, margin: this.getStyle(`margin-text`) });
            }
            this._addExtraSpace = true;
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
            this._addExtraSpace = true;
            return [
                {
                    text: this.translate.instant(`Comment`),
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
            case `italics`:
                return { italics: true };
            case `margin-header1`:
                return [0, 0, 0, 20];
            case `margin-header3`:
                return [0, 15, 0, 10];
            case `margin-type-text`:
                return [0, 0, 0, 10];
            case `margin-item`:
                return [0, 0, 0, 5];
            case `margin-item-2`:
                return [0, 10, 0, 5];
            default:
                return {};
        }
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
