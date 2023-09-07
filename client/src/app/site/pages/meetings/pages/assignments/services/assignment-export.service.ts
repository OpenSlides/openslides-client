import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Content } from 'pdfmake/interfaces';
import { PdfError } from 'src/app/gateways/export/pdf-document.service';
import { MeetingPdfExportService } from 'src/app/site/pages/meetings/services/export';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { ViewAssignment } from '../view-models';
import { AssignmentExportServiceModule } from './assignment-export-service.module';
import { AssignmentPdfService } from './assignment-pdf.service';

/**
 * Controls PDF export for assignments
 */
@Injectable({ providedIn: AssignmentExportServiceModule })
export class AssignmentExportService {
    public constructor(
        private translate: TranslateService,
        private assignmentPdfService: AssignmentPdfService,
        private pdfDocumentService: MeetingPdfExportService,
        private meetingSettingsService: MeetingSettingsService
    ) {}

    /**
     * Generates an pdf out of a given assignment and saves it as file
     *
     * @param assignment the assignment to export
     */
    public exportSingleAssignment(assignment: ViewAssignment): void {
        const doc = this.assignmentPdfService.assignmentToDocDef(assignment);
        const filename = `${this.translate.instant(`Election`)}_${assignment.title}`;
        const metadata = {
            title: filename
        };
        this.pdfDocumentService.download({ docDefinition: doc, filename, metadata });
    }

    /**
     * Generates a pdf document for a list of assignments
     *
     * @param assignments The list of assignments that should be exported as pdf.
     */
    public exportMultipleAssignments(assignments: ViewAssignment[]): void {
        const doc = this.createDocOfMultipleAssignments(assignments);

        const filename = this.translate.instant(`Elections`);
        const metadata = {
            title: filename
        };
        this.pdfDocumentService.download({ docDefinition: doc, filename, metadata });
    }

    /**
     * Helper to generate from a list of assignments a document for the pdf export.
     *
     * @param assignments The list of assignments
     *
     * @returns doc definition as object
     */
    private createDocOfMultipleAssignments(assignments: ViewAssignment[]): Content[] {
        const doc = [];
        const fileList = assignments.map((assignment, index) => {
            try {
                const assignmentDocDef: any = this.assignmentPdfService.assignmentToDocDef(assignment);
                assignmentDocDef[0].id = `${assignment.id}`;
                return index < assignments.length - 1
                    ? [assignmentDocDef, this.pdfDocumentService.getPageBreak()]
                    : [assignmentDocDef];
            } catch (error) {
                const errorText = `${this.translate.instant(`Error during PDF creation of election:`)} ${
                    assignment.title
                }`;
                console.error(`${errorText}\nDebugInfo:\n`, error);
                throw new PdfError(errorText);
            }
        });

        if (assignments.length > 1) {
            doc.push(
                this.pdfDocumentService.createTitle(
                    this.meetingSettingsService.instant(`assignments_export_title`) ?? ``
                ),
                this.pdfDocumentService.createPreamble(
                    this.meetingSettingsService.instant(`assignments_export_preamble`)
                ),
                this.createToc(assignments)
            );
        }

        doc.push(fileList);
        return doc;
    }

    /**
     * Function to create the 'Table of contents'
     *
     * @param assignments All the assignments, who should be exported as PDF.
     *
     * @returns The toc as
     */
    private createToc(assignments: ViewAssignment[]): Content[] {
        const toc = [];
        const tocTitle = {
            text: this.translate.instant(`Table of contents`),
            style: `heading2`
        };

        const tocBody = assignments.map((assignment, index) =>
            this.pdfDocumentService.createTocLine({
                identifier: `${index + 1}`,
                title: assignment.title,
                pageReference: `${assignment.id}`
            })
        );
        toc.push(this.pdfDocumentService.createTocTableDef({ tocBody }));

        return [tocTitle, toc, this.pdfDocumentService.getPageBreak()];
    }
}
