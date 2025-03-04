import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Content, ContentText } from 'pdfmake/interfaces';
import { HtmlToPdfService } from 'src/app/gateways/export/html-to-pdf.service';
import { MeetingPdfExportService } from 'src/app/site/pages/meetings/services/export';

/**
 * Creates a PDF document from a single tpoic
 */
@Injectable()
export class ModerationNotePdfService {
    public constructor(
        private translate: TranslateService,
        private htmlToPdfService: HtmlToPdfService,
        private pdfDocumentService: MeetingPdfExportService
    ) {}

    /**
     * Generates an pdf out of a given topic and saves it as file
     *
     * @param topic the topic to export
     */
    public exportSingleModerationNote(moderationNote: string, title: string): void {
        const doc = this.moderationNoteToDocDef(moderationNote, title);
        const filename = `${this.translate.instant(`Moderation-Note`)}`;
        const metadata = {
            title: filename
        };

        this.pdfDocumentService.download({ docDefinition: doc, filename, metadata });
    }

    private moderationNoteToDocDef(moderationNote: string, moderationNoteTitle: string): Content[] {
        const title = this.createTitle(moderationNoteTitle);
        const text = this.createTextContent(moderationNote);

        return [title, text];
    }

    private createTitle(title: string): ContentText {
        return {
            text: title,
            style: `title`
        };
    }

    private createTextContent(moderationNote: string): Content {
        if (moderationNote) {
            return this.htmlToPdfService.addPlainText(moderationNote);
        } else {
            return [];
        }
    }
}
