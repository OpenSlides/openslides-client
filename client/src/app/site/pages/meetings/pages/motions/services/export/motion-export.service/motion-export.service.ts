import { Injectable } from '@angular/core';
import { ChangeRecoMode, LineNumberingMode } from 'src/app/domain/models/motions/motions.constants';
import { PdfError } from 'src/app/gateways/export/pdf-document.service';

import { ViewMotion } from '../../../view-models';
import { ExportFileFormat, InfoToExport } from '../definitions';
import { MotionCsvExportService } from '../motion-csv-export.service';
import { MotionPdfExportService } from '../motion-pdf-export.service';
import { MotionXlsxExportService } from '../motion-xlsx-export.service';

/**
 * Shape the structure of the dialog data
 */
export interface MotionExportInfo {
    format?: ExportFileFormat;
    lnMode?: LineNumberingMode;
    crMode?: ChangeRecoMode;
    content?: string[];
    metaInfo?: InfoToExport[];
    pdfOptions?: string[];
    comments?: number[];
    showAllChanges?: boolean;
    includePdfAttachments?: boolean;
}

@Injectable({
    providedIn: `root`
})
export class MotionExportService {
    public constructor(
        private pdfExport: MotionPdfExportService,
        private csvExport: MotionCsvExportService,
        private xlsxExport: MotionXlsxExportService
    ) {}

    public evaluateExportRequest(exportInfo: MotionExportInfo, data: ViewMotion[]): void {
        if (!exportInfo) {
            return;
        }
        if (!exportInfo.format) {
            throw new Error(`No export format was provided`);
        }
        if (exportInfo.format === ExportFileFormat.PDF) {
            this.exportPdfFile(data, exportInfo);
        } else if (exportInfo.format === ExportFileFormat.CSV) {
            this.exportCsvFile(data, exportInfo);
        } else if (exportInfo.format === ExportFileFormat.XLSX) {
            this.exportXlsxFile(data, exportInfo);
        }
    }

    private exportPdfFile(data: ViewMotion[], exportInfo: MotionExportInfo): void {
        try {
            this.pdfExport.exportMotionCatalog(data, exportInfo);
        } catch (err) {
            if (err instanceof PdfError) {
                console.error(`PDFError: `, err);
                /**
                 * TODO: Has been this.raiseError(err.message) before. Central error treatment
                 */
            } else {
                throw err;
            }
        }
    }

    private exportCsvFile(data: ViewMotion[], exportInfo: MotionExportInfo): void {
        const content = [];
        const comments = [];
        if (exportInfo.content) {
            content.push(...exportInfo.content);
        }
        if (exportInfo.metaInfo) {
            content.push(...exportInfo.metaInfo);
        }
        if (exportInfo.comments) {
            comments.push(...exportInfo.comments);
        }
        this.csvExport.exportMotionList(data, content, comments, exportInfo.crMode);
    }

    private exportXlsxFile(motions: ViewMotion[], exportInfo: MotionExportInfo): void {
        this.xlsxExport.exportMotionList({
            motions,
            infoToExport: exportInfo.metaInfo,
            commentIds: exportInfo.comments
        });
    }
}
