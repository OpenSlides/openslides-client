import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ViewMotionCommentSection } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingPdfExportService } from 'src/app/site/pages/meetings/services/export';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { ViewMotion } from '../../../view-models';
import { AmendmentListPdfService } from '../amendment-list-pdf.service';
import { MotionExportInfo } from '../motion-export.service';
import { MotionPdfService } from '../motion-pdf.service';
import { MotionPdfCatalogService } from '../motion-pdf-catalog.service';
import { MotionsExportModule } from '../motions-export.module';

/**
 * Export service to handle various kind of exporting necessities.
 */
@Injectable({
    providedIn: MotionsExportModule
})
export class MotionPdfExportService {
    public constructor(
        private translate: TranslateService,
        private meetingSettingsService: MeetingSettingsService,
        private motionPdfService: MotionPdfService,
        private amendmentListPdfService: AmendmentListPdfService,
        private pdfCatalogService: MotionPdfCatalogService,
        private pdfDocumentService: MeetingPdfExportService
    ) {}

    /**
     * Exports a single motions to PDFnumberOrTitle
     *
     * @param motion The motion to export
     */
    public exportSingleMotion(motion: ViewMotion, exportInfo?: MotionExportInfo): void {
        const doc = this.motionPdfService.motionToDocDef({ motion, exportInfo });
        const filename = `${this.translate.instant(`Motion`)} ${motion.numberOrTitle}`;
        const metadata = {
            title: filename
        };
        this.pdfDocumentService.download({ docDefinition: doc, filename, metadata });
    }

    /**
     * Exports multiple motions to a collection of PDFs
     *
     * @param motions the motions to export
     */
    public exportMotionCatalog(motions: ViewMotion[], exportInfo: MotionExportInfo): void {
        const docDefinition = this.pdfCatalogService.motionListToDocDef(motions, exportInfo);
        const filename = this.meetingSettingsService.instant(`motions_export_title`) as string;
        const metadata = {
            title: filename
        };
        this.pdfDocumentService.download({ docDefinition, filename, metadata, exportInfo });
    }

    /**
     * Exports a table of the motions in order of their call list
     *
     * @param motions the motions to export
     */
    public exportPdfCallList(motions: ViewMotion[]): void {
        const docDefinition = this.motionPdfService.callListToDoc(motions);
        const filename = this.translate.instant(`Call list`);
        const metadata = {
            title: filename
        };
        this.pdfDocumentService.downloadLandscape({ docDefinition, filename, metadata });
    }

    /**
     * Exports the given personalNote with some short information about the
     * motion the note refers to
     *
     * @param note
     * @param motion
     */
    public exportPersonalNote(motion: ViewMotion): void {
        // Get the note in a clever way. E.g. (this should work...):
        const personalNote = motion.personal_notes?.[0];
        const note = personalNote ? personalNote.note : ``;

        const docDefinition = this.motionPdfService.textToDocDef(note, motion, `Personal note`);
        const filename = `${motion.number} - ${this.translate.instant(`Personal note`)}`;
        const metadata = {
            title: filename
        };
        this.pdfDocumentService.download({ docDefinition, filename, metadata });
    }

    /**
     * Exports the given comment with some short information about the
     * motion the note refers to numberOrTitle
     * @param comment
     * @param motion
     */
    public exportComment(comment: ViewMotionCommentSection, motion: ViewMotion): void {
        const motionComment = motion.getCommentForSection(comment);
        if (motionComment && motionComment.comment) {
            const docDefinition = this.motionPdfService.textToDocDef(motionComment.comment, motion, comment.name);
            const filename = `${motion.numberOrTitle} - ${comment.name}`;
            const metadata = { title: filename };
            this.pdfDocumentService.download({ docDefinition, filename, metadata });
        }
    }

    /**
     * Exports the amendments to the given motion as an overview table
     * @param parentMotion
     */
    public exportAmendmentList(amendments: ViewMotion[], parentMotion?: ViewMotion): void {
        let filename: string;
        if (parentMotion) {
            filename = `${this.translate.instant(`Amendments to`)} ${parentMotion.getListTitle()}`;
        } else {
            filename = `${this.translate.instant(`Amendments`)}`;
        }
        const docDefinition = this.amendmentListPdfService.overviewToDocDef(filename, amendments);
        const metadata = {
            title: filename
        };
        this.pdfDocumentService.downloadLandscape({ docDefinition, filename, metadata });
    }
}
