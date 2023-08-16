import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MeetingPdfExportService } from 'src/app/site/pages/meetings/services/export/meeting-pdf-export.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

import { ParticipantExportModule } from '../participant-export.module';
import { ParticipantPdfService } from '../participant-pdf.service';

/**
 * Export service to handle various kind of exporting necessities for participants.
 */
@Injectable({
    providedIn: ParticipantExportModule
})
export class ParticipantPdfExportService {
    public constructor(
        private translate: TranslateService,
        private userPdfService: ParticipantPdfService,
        private pdfDocumentService: MeetingPdfExportService
    ) {}

    /**
     * Export a participants list as PDF
     */
    public exportParticipants(...participants: ViewUser[]): void {
        const filename = this.translate.instant(`List of participants`);
        const metadata = {
            title: filename
        };
        this.pdfDocumentService.download({
            docDefinition: this.userPdfService.createUserListDocDef(participants),
            filename,
            metadata
        });
    }

    /**
     * Export a PDF document containing access information for participants
     */
    public exportAccessDocuments(...participants: ViewUser[]): void {
        const doc: object[] = [];
        participants.forEach(participant => {
            doc.push(this.userPdfService.userAccessToDocDef(participant));
        });
        const filename = this.getPdfFilenameForAccessDocuments(participants);
        const metadata = {
            title: filename
        };
        this.pdfDocumentService.download({ docDefinition: doc, filename, metadata });
    }

    /**
     * Creates a filename depending on the length of given participants
     */
    private getPdfFilenameForAccessDocuments(participants: ViewUser[]): string {
        if (participants.length === 1) {
            const firstParticipant = participants[0];
            return `${this.translate.instant(`Access-data`)} ${firstParticipant.short_name}`;
        }
        return `${this.translate.instant(`Access-data`)}`;
    }
}
