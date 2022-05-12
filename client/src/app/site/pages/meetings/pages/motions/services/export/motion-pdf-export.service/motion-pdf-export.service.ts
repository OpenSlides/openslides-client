import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewMotion } from '../../../view-models';
import { MotionExportInfo } from '../motion-export.service';
import { MeetingPdfExportService } from 'src/app/site/pages/meetings/services/export';
import { ViewMotionCommentSection } from 'src/app/site/pages/meetings/pages/motions';
import { AmendmentListPdfService } from '../amendment-list-pdf.service';
import { MotionPdfService } from '../motion-pdf.service';
import { MotionPdfCatalogService } from '../motion-pdf-catalog.service';
import { MotionsExportModule } from '../motions-export.module';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

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
        const filename = `${_(`Motion`)} ${motion.numberOrTitle}`;
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
        const motions_export_title = this.meetingSettingsService.instant(`motions_export_title`) as string;
        const filename = _(motions_export_title);
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
        const filename = _(`Call list`);
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
        const filename = `${motion.number} - ${_(`Personal note`)}`;
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
            filename = `${_(`Amendments to`)} ${parentMotion.getListTitle()}`;
        } else {
            filename = `${_(`Amendments`)}`;
        }
        const docDefinition = this.amendmentListPdfService.overviewToDocDef(filename, amendments);
        const metadata = {
            title: filename
        };
        this.pdfDocumentService.downloadLandscape({ docDefinition, filename, metadata });
    }
}
