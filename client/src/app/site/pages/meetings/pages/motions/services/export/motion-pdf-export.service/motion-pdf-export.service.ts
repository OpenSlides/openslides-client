import { Injectable } from '@angular/core';
import { PDFDocument } from '@cantoo/pdf-lib';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { ProgressSnackBarService } from 'src/app/gateways/export/progress-snack-bar/services/progress-snack-bar.service';
import { ProgressSnackBarControlService } from 'src/app/gateways/export/progress-snack-bar/services/progress-snack-bar-control.service';
import { ViewMotionCommentSection } from 'src/app/site/pages/meetings/pages/motions';
import { MeetingPdfExportService } from 'src/app/site/pages/meetings/services/export';

import { ViewMotion } from '../../../view-models';
import { AmendmentListPdfService } from '../amendment-list-pdf.service';
import { MotionExportInfo } from '../motion-export.service';
import { MotionPdfService } from '../motion-pdf.service';
import { MotionPdfCatalogService } from '../motion-pdf-catalog.service';

/**
 * Export service to handle various kind of exporting necessities.
 */
@Injectable({
    providedIn: `root`
})
export class MotionPdfExportService {
    public constructor(
        private translate: TranslateService,
        private motionPdfService: MotionPdfService,
        private amendmentListPdfService: AmendmentListPdfService,
        private pdfCatalogService: MotionPdfCatalogService,
        private pdfDocumentService: MeetingPdfExportService,
        private progressSnackBarService: ProgressSnackBarService,
        private progressService: ProgressSnackBarControlService
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
        if (exportInfo.content.includes(`includePdfAttachments`)) {
            try {
                this.exportMotionCatalogWithAttachments(motions, exportInfo);
            } catch (e) {
                this.progressSnackBarService.dismiss();
            }
            return;
        }

        const docDefinition = this.pdfCatalogService.motionListToDocDef(motions, exportInfo);
        const filename = this.translate.instant(`Motions`);
        const metadata = {
            title: filename
        };
        this.pdfDocumentService.download({ docDefinition, filename, metadata, exportInfo });
    }

    /**
     * Exports multiple motions to a collection of PDFs including pdf attachments
     *
     * @param motions the motions to export
     */
    private async exportMotionCatalogWithAttachments(
        motions: ViewMotion[],
        exportInfo: MotionExportInfo
    ): Promise<void> {
        let canceled = false;
        this.progressSnackBarService
            .open({
                duration: 0
            })
            .then(progressBarRef => {
                // Listen to clicks on the cancel button
                progressBarRef.onAction().subscribe(() => {
                    canceled = true;
                    this.progressSnackBarService.dismiss();
                });
                this.progressService.message = this.translate.instant(`Creating motion exports`) + `...`;
                this.progressService.progressMode = `determinate`;
            });

        const motionPdfPromises = [];
        for (let i = 0; i < motions.length; i++) {
            const motion = motions[i];
            this.progressService.message =
                this.translate.instant(`Creating motion exports`) + ` (${i + 1}/${motions.length})`;
            this.progressService.progressAmount = Math.ceil(((i + 1) / motions.length) * 100);
            const doc = this.motionPdfService.motionToDocDef({ motion, exportInfo });
            const filename = `${this.translate.instant(`Motion`)} ${motion.numberOrTitle}`;
            const metadata = {
                title: filename
            };
            const motionPdf = this.pdfDocumentService.blob({
                docDefinition: doc,
                filename,
                metadata,
                exportInfo,
                disableProgress: true
            });
            await motionPdf;
            motionPdfPromises.push(motionPdf);

            for (const file of motion.attachment_meeting_mediafiles) {
                if (file.mediafile.mimetype === `application/pdf`) {
                    motionPdfPromises.push(fetch(file.url));
                }
            }

            if (canceled) {
                return;
            }
        }

        this.progressService.message = this.translate.instant(`Downloading attachments`);
        this.progressService.progressMode = `indeterminate`;
        const motionPdfs: (Blob | Response)[] = await Promise.all(motionPdfPromises);

        this.progressService.message = this.translate.instant(`Creating PDF file ...`);
        const mergedPdf = await PDFDocument.create();
        for (let i = 0; i < motionPdfs.length; i++) {
            const mPdfBlob = motionPdfs[i];
            this.progressService.progressAmount = Math.ceil(((i + 1) / motionPdfs.length) * 100);
            if (!mPdfBlob) {
                continue;
            }

            const mPdf = await PDFDocument.load(await mPdfBlob.arrayBuffer());
            const copiedPages = await mergedPdf.copyPages(mPdf, mPdf.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
        }
        const mergedPdfFile = await mergedPdf.save();
        if (!canceled) {
            saveAs(new Blob([mergedPdfFile]), `${this.translate.instant(`Motions`)}.pdf`);
        }
        this.progressSnackBarService.dismiss();
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
