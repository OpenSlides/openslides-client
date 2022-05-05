import { Injectable } from '@angular/core';
import {
    PdfDocumentService,
    PdfFontDescription,
    PdfVirtualFileSystem,
    TocLineDefinition,
    TocTableDefinition
} from 'src/app/gateways/export/pdf-document.service';
import { mmToPoints } from 'src/app/infrastructure/utils';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { MeetingPdfExportModule } from './meeting-pdf-export.module';
import { HttpService } from 'src/app/gateways/http.service';
import { MediaManageService } from 'src/app/site/pages/meetings/services/media-manage.service';
import { FontPlace } from 'src/app/domain/models/mediafiles/mediafile.constants';

interface MeetingDownloadLandscapeConfig {
    docDefinition: object;
    filename: string;
    metadata?: object;
}

interface MeetingDownloadConfig extends MeetingDownloadLandscapeConfig {
    exportInfo?: any;
}

@Injectable({
    providedIn: MeetingPdfExportModule
})
export class MeetingPdfExportService {
    private get fontSize(): number | null {
        return this.meetingSettingsService.instant(`export_pdf_fontsize`);
    }

    constructor(
        private pdfExportService: PdfDocumentService,
        private meetingSettingsService: MeetingSettingsService,
        private httpService: HttpService,
        private mediaManageService: MediaManageService
    ) {}

    public download(config: MeetingDownloadConfig): void {
        const pageMarginLeft = mmToPoints(this.meetingSettingsService.instant(`export_pdf_page_margin_left`)!);
        const pageMarginTop = mmToPoints(this.meetingSettingsService.instant(`export_pdf_page_margin_top`)!);
        const pageMarginRight = mmToPoints(this.meetingSettingsService.instant(`export_pdf_page_margin_right`)!);
        const pageMarginBottom = mmToPoints(this.meetingSettingsService.instant(`export_pdf_page_margin_bottom`)!);

        const pageMargins: [number, number, number, number] = [
            pageMarginLeft,
            pageMarginTop,
            pageMarginRight,
            pageMarginBottom
        ];
        this.pdfExportService.download({ ...config, ...this.createDownloadConfig(), pageMargins });
    }

    public downloadLandscape(config: MeetingDownloadConfig): void {
        this.pdfExportService.downloadLandscape({ ...config, ...this.createDownloadConfig() });
    }

    public downloadWaitableDoc(filename: string, buildDocFn: () => Promise<object>): void {
        this.pdfExportService.downloadWaitableDoc(filename, buildDocFn, async () => this.getFonts());
    }

    public getPageBreak(): any {
        return this.pdfExportService.getPageBreak();
    }

    public getSpacer(): any {
        return this.pdfExportService.getSpacer();
    }

    public createTitle(title: string): any {
        return this.pdfExportService.createTitle(title);
    }

    public createPreamble(preamble: string | null): any {
        return this.pdfExportService.createPreamble(preamble);
    }

    public createTocTableDef(definition: TocTableDefinition, ...headers: any[]): any {
        return this.pdfExportService.createTocTableDef(definition, ...headers);
    }

    public createTocLine(definition: TocLineDefinition, ...subTitles: any[]): any {
        return this.pdfExportService.createTocLine(definition, ...subTitles);
    }

    public createTocLineInline(text: string, italics: boolean = false): any {
        return this.pdfExportService.createTocLineInline(text, italics);
    }

    public drawCircle(center: number, radius: number): any {
        return this.pdfExportService.drawCircle(center, radius);
    }

    private getFonts(): PdfFontDescription {
        return {
            normal: this.getFontName(`regular`),
            bold: this.getFontName(`bold`),
            italics: this.getFontName(`italic`),
            bolditalics: this.getFontName(`bold_italic`)
        };
    }

    /**
     * Returns the name of a font from the value of the given
     * config variable.
     *
     * @param place the config variable of the font (font_regular, font_italic)
     * @returns the name of the selected font
     */
    private getFontName(place: FontPlace): string {
        const url = this.mediaManageService.getFontUrl(place);
        return url.split(`/`).pop()!;
    }

    private createVirtualFileSystem(): Promise<PdfVirtualFileSystem> {
        return this.loadFonts();
    }

    private async loadFonts(): Promise<PdfVirtualFileSystem> {
        const fontPathList: string[] = Array.from(
            // create a list without redundancies
            new Set(this.mediaManageService.allFontPlaces.map(place => `${this.mediaManageService.getFontUrl(place)}`))
        );

        const promises = fontPathList.map(fontPath =>
            this.httpService.downloadAsBase64(fontPath).then(base64 => ({
                [fontPath.split(`/`).pop()!]: base64
            }))
        );
        const binaryDataUrls = await Promise.all(promises);
        return binaryDataUrls.mapToObject(entry => ({ ...entry }));
    }

    private createDownloadConfig(): {
        fontSize: number;
        loadFonts: () => PdfFontDescription;
        createVfs: () => Promise<PdfVirtualFileSystem>;
    } {
        return {
            fontSize: this.fontSize!,
            loadFonts: () => this.getFonts(),
            createVfs: () => this.createVirtualFileSystem()
        };
    }
}
