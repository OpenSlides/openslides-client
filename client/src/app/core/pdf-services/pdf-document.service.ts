import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ProgressSnackBarComponent } from 'app/shared/components/progress-snack-bar/progress-snack-bar.component';
import { PDF_OPTIONS } from 'app/site/motions/motions.constants';
import { MotionExportInfo } from 'app/site/motions/services/motion-export.service';
import { saveAs } from 'file-saver';
import * as moment from 'moment';

import { HttpService } from '../core-services/http.service';
import { FontPlace, MediaManageService } from '../ui-services/media-manage.service';
import { MeetingSettingsService } from '../ui-services/meeting-settings.service';
import { ProgressService } from '../ui-services/progress.service';

/**
 * Enumeration to define possible values for the styling.
 */
export enum StyleType {
    DEFAULT = `tocEntry`,
    SUBTITLE = `subtitle`,
    SUB_ENTRY = `tocSubEntry`,
    CATEGORY_SECTION = `tocCategorySection`
}

/**
 * Enumeration to describe the type of borders.
 */
export enum BorderType {
    DEFAULT = `noBorders`,
    LIGHT_HORIZONTAL_LINES = `lightHorizontalLines`,
    HEADER_ONLY = `headerLineOnly`
}

/**
 * Custom PDF error class to handle errors in a safer way
 */
export class PdfError extends Error {
    public __proto__: PdfError;

    public constructor(public message: string) {
        super(message);
        const trueProto = new.target.prototype;
        this.__proto__ = trueProto;
    }
}

/**
 * Provides the general document structure for PDF documents, such as page margins, header, footer and styles.
 * Also provides general purpose open and download functions.
 *
 * Use a local pdf service (i.e. MotionPdfService) to get the document definition for the content and
 * use this service to open or download the pdf document
 *
 * @example
 * ```ts
 * const motionContent = this.motionPdfService.motionToDocDef(this.motion);
 * this.pdfDocumentService.download(motionContent, 'test.pdf');
 * ```
 */
@Injectable({
    providedIn: `root`
})
export class PdfDocumentService {
    /**
     * A list of all images to add to the virtual file system.
     * May still be filling at header and footer creation
     */
    private imageUrls: string[] = [];

    private pdfWorker: Worker;

    public constructor(
        private translate: TranslateService,
        private meetingSettingsService: MeetingSettingsService,
        private httpService: HttpService,
        private matSnackBar: MatSnackBar,
        private progressService: ProgressService,
        private mediaManageService: MediaManageService
    ) {}

    /**
     * Define the pdfmake virtual file system, adding the fonts
     *
     * @returns the vfs-object
     */
    private async initVfs(): Promise<object> {
        const fontPathList: string[] = Array.from(
            // create a list without redundancies
            new Set(this.mediaManageService.allFontPlaces.map(place => `/${this.mediaManageService.getFontUrl(place)}`))
        );

        const promises = fontPathList.map(fontPath =>
            this.httpService.downloadAsBase64(fontPath).then(base64 => ({
                [fontPath.split(`/`).pop()]: base64
            }))
        );
        const binaryDataUrls = await Promise.all(promises);
        let vfs = {};
        binaryDataUrls.map(entry => {
            vfs = {
                ...vfs,
                ...entry
            };
        });
        return vfs;
    }

    /**
     * Returns the name of a font from the value of the given
     * config variable.
     *
     * @param fontType the config variable of the font (font_regular, font_italic)
     * @returns the name of the selected font
     */
    private getFontName(place: FontPlace): string {
        const url = this.mediaManageService.getFontUrl(place);
        return url.split(`/`).pop();
    }

    /**
     * Calculates millimeters in points for pdfmake.
     *
     * @param millimeters
     * @return points
     */
    private mmToPoints(mm: number): number {
        const inches = mm / 25.4;
        return inches * 72;
    }

    /**
     * Overall document definition and styles for the most PDF documents
     *
     * @param documentContent the content of the pdf as object
     * @param metadata
     * @param imageUrls Array of optional images (url, placeholder) to be inserted
     * @param customMargins optionally overrides the margins
     * @param landscape optional landscape page orientation instead of default portrait
     * @returns the pdf document definition ready to export
     */
    private async getStandardPaper(
        documentContent: object,
        pageMargins: [number, number, number, number],
        metadata?: object,
        exportInfo?: MotionExportInfo,
        imageUrls?: string[],
        landscape?: boolean
    ): Promise<object> {
        this.imageUrls = imageUrls ? imageUrls : [];
        const pageSize = this.meetingSettingsService.instant(`export_pdf_pagesize`);
        const result = {
            pageSize: pageSize || `A4`,
            pageOrientation: landscape ? `landscape` : `portrait`,
            pageMargins: pageMargins,
            defaultStyle: {
                font: `PdfFont`,
                fontSize: this.meetingSettingsService.instant(`export_pdf_fontsize`)
            },
            header: {},
            // real footer gets created in the worker
            tmpfooter: this.getFooter([pageMargins[0], pageMargins[2]], exportInfo),
            info: metadata,
            content: documentContent,
            styles: this.getStandardPaperStyles()
        };

        if (exportInfo && exportInfo.pdfOptions && exportInfo.pdfOptions.includes(PDF_OPTIONS.Header)) {
            result.header = this.getHeader([pageMargins[0], pageMargins[2]]);
        }

        // DEBUG: printing the following. Do not remove, just comment out
        // console.log('MakePDF result :\n---\n', JSON.stringify(result), '\n---\n');

        return result;
    }

    /**
     * Overall document definition and styles for blank PDF documents
     * (e.g. ballots)
     *
     * @param documentContent the content of the pdf as object
     * @param imageUrl an optional image to insert into the ballot
     * @returns the pdf document definition ready to export
     */
    private async getBallotPaper(documentContent: object, imageUrl?: string): Promise<object> {
        this.imageUrls = imageUrl ? [imageUrl] : [];
        const result = {
            pageSize: `A4`,
            pageMargins: [0, 0, 0, 0],
            defaultStyle: {
                font: `PdfFont`,
                fontSize: 10
            },
            content: documentContent,
            styles: this.getBlankPaperStyles()
        };
        return result;
    }

    /**
     * Get pdfFonts from storage
     */
    private getPdfFonts(): object {
        return {
            normal: this.getFontName(`regular`),
            bold: this.getFontName(`bold`),
            italics: this.getFontName(`italic`),
            bolditalics: this.getFontName(`bold_italic`)
        };
    }

    private formatDate(unixTimestamp: number, momentFormat: string): string | null {
        if (!unixTimestamp) {
            return null;
        }
        return moment.unix(unixTimestamp).local().format(momentFormat);
    }

    /**
     * formats the meeting time with start and end date to a range.
     * Same dates and missing dates will be filtered
     */
    private formatTimeRange(start?: string, end?: string): string {
        return [start, end].filter((item, pos, self) => item && self.indexOf(item) === pos).join(` - `);
    }

    /**
     * use moment to get the start time.
     * Still no real service to do this for us.
     */
    private getMeetingTime(): string {
        const dateFormat = `l`;
        const lang = this.translate.currentLang ? this.translate.currentLang : this.translate.defaultLang;
        moment.locale(lang);
        const startTimeString = this.formatDate(this.meetingSettingsService.instant(`start_time`), dateFormat);
        const endTimeString = this.formatDate(this.meetingSettingsService.instant(`end_time`), dateFormat);
        return this.formatTimeRange(startTimeString, endTimeString);
    }

    /**
     * Creates the header doc definition for normal PDF documents
     *
     * @param lrMargin optional margin overrides
     * @returns an object that contains the necessary header definition
     */
    private getHeader(lrMargin: [number, number]): object {
        // check for the required logos
        let logoHeaderLeftUrl = this.mediaManageService.getLogoUrl(`pdf_header_l`);
        let logoHeaderRightUrl = this.mediaManageService.getLogoUrl(`pdf_header_r`);
        let text;
        const columns = [];

        // add the left logo to the header column
        if (logoHeaderLeftUrl) {
            if (logoHeaderLeftUrl.indexOf(`/`) === 0) {
                logoHeaderLeftUrl = logoHeaderLeftUrl.substr(1); // remove trailing /
            }
            columns.push({
                image: logoHeaderLeftUrl,
                fit: [180, 40],
                width: `20%`
            });
            this.imageUrls.push(logoHeaderLeftUrl);
        }

        // add the header text if no logo on the right was specified
        if (logoHeaderLeftUrl && logoHeaderRightUrl) {
            text = ``;
        } else {
            const name = this.translate.instant(this.meetingSettingsService.instant(`name`));
            const description = this.translate.instant(this.meetingSettingsService.instant(`description`));
            const location = this.meetingSettingsService.instant(`location`);
            const line1 = [name, description].filter(Boolean).join(` - `);
            const line2 = [location, this.getMeetingTime()].filter(Boolean).join(`, `);
            text = [line1, line2].join(`\n`);
        }
        columns.push({
            text,
            style: `headerText`,
            alignment: logoHeaderRightUrl ? `left` : `right`
        });

        // add the logo to the right
        if (logoHeaderRightUrl) {
            if (logoHeaderRightUrl.indexOf(`/`) === 0) {
                logoHeaderRightUrl = logoHeaderRightUrl.substr(1); // remove trailing /
            }
            columns.push({
                image: logoHeaderRightUrl,
                fit: [180, 40],
                alignment: `right`,
                width: `20%`
            });
            this.imageUrls.push(logoHeaderRightUrl);
        }
        const margin = [lrMargin[0], 30, lrMargin[1], 10];
        // pdfmake order: [left, top, right, bottom]

        return {
            color: `#555`,
            fontSize: 9,
            margin,
            columns,
            columnGap: 10
        };
    }

    /**
     * Creates the footer doc definition for normal PDF documents.
     * Adds page numbers into the footer
     *
     * @param currentPage holds the number of the current page
     * @param pageCount holds the page count
     * @param lrMargin optionally overriding the margins
     * @returns the footer doc definition
     */
    private getFooter(lrMargin?: [number, number], exportInfo?: MotionExportInfo): object {
        const columns = [];
        const showPageNr = exportInfo && exportInfo.pdfOptions ? exportInfo.pdfOptions.includes(`page`) : true;
        const showDate = exportInfo && exportInfo.pdfOptions ? exportInfo.pdfOptions.includes(`date`) : false;
        let logoContainerWidth: string;
        let pageNumberPosition: string;
        let logoContainerSize: number[];
        const logoFooterLeftUrl = this.mediaManageService.getLogoUrl(`pdf_footer_l`);
        const logoFooterRightUrl = this.mediaManageService.getLogoUrl(`pdf_footer_r`);

        let footerPageNumber = ``;
        if (showPageNr) {
            // footerPageNumber += `${currentPage} / ${pageCount}`;
            // replace with `${currentPage} / ${pageCount}` in worker
            footerPageNumber += `%PAGENR%`;
        }

        let footerDate = {};
        if (showDate) {
            footerDate = {
                text: `${this.translate.instant(`As of`)}: ${new Date().toLocaleDateString(
                    this.translate.currentLang
                )}`,
                fontSize: 6
            };
        }

        // if there is a single logo, give it a lot of space
        if (logoFooterLeftUrl && logoFooterRightUrl) {
            logoContainerWidth = `20%`;
            logoContainerSize = [180, 40];
        } else {
            logoContainerWidth = `80%`;
            logoContainerSize = [400, 50];
        }

        // the position of the page number depends on the logos
        if (logoFooterLeftUrl && logoFooterRightUrl) {
            pageNumberPosition = `center`;
        } else if (logoFooterLeftUrl && !logoFooterRightUrl) {
            pageNumberPosition = `right`;
        } else if (logoFooterRightUrl && !logoFooterLeftUrl) {
            pageNumberPosition = `left`;
        } else {
            pageNumberPosition = this.meetingSettingsService.instant(`export_pdf_pagenumber_alignment`);
        }

        // add the left footer logo, if any
        if (logoFooterLeftUrl) {
            columns.push({
                image: logoFooterLeftUrl,
                fit: logoContainerSize,
                width: logoContainerWidth,
                alignment: `left`
            });
            this.imageUrls.push(logoFooterLeftUrl);
        }

        // add the page number
        columns.push({
            stack: [footerPageNumber, footerDate],
            style: `footerPageNumber`,
            alignment: pageNumberPosition
        });

        // add the right footer logo, if any
        if (logoFooterRightUrl) {
            columns.push({
                image: logoFooterRightUrl,
                fit: logoContainerSize,
                width: logoContainerWidth,
                alignment: `right`
            });
            this.imageUrls.push(logoFooterRightUrl);
        }

        const margin = [lrMargin ? lrMargin[0] : 75, 0, lrMargin ? lrMargin[0] : 75, 10];
        return {
            margin,
            columns,
            columnGap: 10
        };
    }

    /**
     * Shows the progress bar earlier
     */
    private showProgress(): void {
        const progressBarRef = this.matSnackBar.openFromComponent(ProgressSnackBarComponent, {
            duration: 0
        });

        // Listen to clicks on the cancel button
        progressBarRef.onAction().subscribe(() => {
            this.cancelPdfCreation();
        });

        this.progressService.message = this.translate.instant(`Creating PDF file ...`);
        this.progressService.progressMode = `determinate`;
    }

    /**
     * Downloads a pdf with the standard page definitions.
     *
     * @param docDefinition the structure of the PDF document
     * @param filename the name of the file to use
     * @param metadata
     */
    public download(docDefinition: object, filename: string, metadata?: object, exportInfo?: MotionExportInfo): void {
        this.showProgress();

        const pageMargins: [number, number, number, number] = [
            this.mmToPoints(this.meetingSettingsService.instant(`export_pdf_page_margin_left`)),
            this.mmToPoints(this.meetingSettingsService.instant(`export_pdf_page_margin_top`)),
            this.mmToPoints(this.meetingSettingsService.instant(`export_pdf_page_margin_bottom`)),
            this.mmToPoints(this.meetingSettingsService.instant(`export_pdf_page_margin_bottom`))
        ];

        this.getStandardPaper(docDefinition, pageMargins, metadata, exportInfo, null).then(doc => {
            this.createPdf(doc, filename);
        });
    }

    /**
     * Downloads a pdf in landscape orientation
     *
     * @param docDefinition the structure of the PDF document
     * @param filename the name of the file to use
     * @param metadata
     */
    public downloadLandscape(docDefinition: object, filename: string, metadata?: object): void {
        this.showProgress();
        this.getStandardPaper(docDefinition, [50, 80, 50, 75], metadata, null, null, true).then(doc => {
            this.createPdf(doc, filename);
        });
    }

    /**
     * Downloads a pdf with the ballot papet page definitions.
     *
     * @param docDefinition the structure of the PDF document
     * @param filename the name of the file to use
     * @param logo (optional) url of a logo to be placed as ballot logo
     */
    public downloadWithBallotPaper(docDefinition: object, filename: string, logo?: string): void {
        this.showProgress();
        this.getBallotPaper(docDefinition, logo).then(doc => {
            this.createPdf(doc, filename);
        });
    }

    /**
     * Triggers the actual page creation and saving.
     *
     * @param doc the finished layout
     * @param filetitle the filename (without extension) to save as
     */
    private async createPdf(doc: object, filetitle: string): Promise<void> {
        const filename = `${filetitle}.pdf`;
        const fonts = this.getPdfFonts();
        const vfs = await this.initVfs();
        await this.loadAllImages(vfs);

        const isIE = /msie\s|trident\//i.test(window.navigator.userAgent);
        if (typeof Worker !== `undefined` && !isIE) {
            this.pdfWorker = new Worker(new URL(`./pdf-worker.worker`, import.meta.url), {
                type: `module`
            });

            // the result of the worker
            this.pdfWorker.onmessage = ({ data }) => {
                // if the worker returns a numbers, is always the progress
                if (typeof data === `number`) {
                    // update progress
                    const progress = Math.ceil(data * 100);
                    this.progressService.progressAmount = progress;
                }

                // if the worker returns an object, it's always the document
                if (typeof data === `object`) {
                    this.matSnackBar.dismiss();
                    saveAs(data, filename, { autoBom: true });
                    this.pdfWorker = null;
                }
            };

            this.pdfWorker.postMessage({
                doc: JSON.parse(JSON.stringify(doc)),
                fonts,
                vfs
            });
        } else {
            this.matSnackBar.dismiss();
            this.matSnackBar.open(this.translate.instant(`Cannot create PDF files on this browser.`), ``, {
                duration: 0
            });
        }
    }

    /**
     * Cancel the pdf generation
     */
    private cancelPdfCreation(): void {
        if (this.pdfWorker) {
            this.pdfWorker.terminate();
            this.pdfWorker = null;
        }
    }

    /**
     * Definition of styles for standard papers
     *
     * @returns an object that contains all pdf styles
     */
    private getStandardPaperStyles(): object {
        const pageSize = this.meetingSettingsService.instant(`export_pdf_pagesize`);
        return {
            title: {
                fontSize: pageSize === `A5` ? 14 : 16,
                margin: [0, 0, 0, 20],
                bold: true
            },
            subtitle: {
                fontSize: 9,
                margin: [0, -20, 0, 10],
                color: `grey`
            },
            preamble: {
                margin: [0, 0, 0, 10]
            },
            headerText: {
                fontSize: 10,
                margin: [0, 10, 0, 0]
            },
            footerPageNumber: {
                fontSize: 8,
                margin: [0, 15, 0, 0],
                color: `#555`
            },
            boldText: {
                bold: true
            },
            smallText: {
                fontSize: 8
            },
            heading2: {
                fontSize: pageSize === `A5` ? 12 : 14,
                margin: [0, 0, 0, 10],
                bold: true
            },
            heading3: {
                fontSize: pageSize === `A5` ? 10 : 12,
                margin: [0, 10, 0, 0],
                bold: true
            },
            userDataHeading: {
                fontSize: 14,
                margin: [0, 10],
                bold: true
            },
            userDataTopic: {
                fontSize: 12,
                margin: [0, 5]
            },
            userDataValue: {
                fontSize: 12,
                margin: [15, 5]
            },
            tocEntry: {
                fontSize: pageSize === `A5` ? 10 : 11,
                margin: [0, 0, 0, 0],
                bold: false
            },
            tocHeaderRow: {
                fontSize: 7
            },
            tocSubEntry: {
                fontSize: pageSize === `A5` ? 9 : 10,
                color: `#404040`
            },
            tocCategoryEntry: {
                fontSize: pageSize === `A5` ? 10 : 11,
                margin: [10, 0, 0, 0],
                bold: false
            },
            tocCategoryTitle: {
                fontSize: pageSize === `A5` ? 10 : 11,
                margin: [0, 0, 0, 4],
                bold: true
            },
            tocSubcategoryTitle: {
                fontSize: pageSize === `A5` ? 9 : 10,
                margin: [0, 0, 0, 4],
                bold: true
            },
            tocCategorySection: {
                margin: [0, 0, 0, 10]
            },
            userDataTitle: {
                fontSize: 26,
                margin: [0, 0, 0, 0],
                bold: true
            },
            tableHeader: {
                bold: true,
                fillColor: `white`
            },
            listParent: {
                fontSize: 14,
                margin: [0, 5]
            },
            listChild: {
                fontSize: 12,
                margin: [0, 5]
            },
            textItem: {
                fontSize: 11,
                margin: [0, 7]
            }
        };
    }

    /**
     * Definition of styles for ballot papers
     *
     * @returns an object that contains a limited set of pdf styles
     *  used for ballots
     */
    private getBlankPaperStyles(): object {
        return {
            title: {
                fontSize: 14,
                bold: true,
                margin: [30, 30, 0, 0]
            },
            description: {
                fontSize: 11,
                margin: [30, 0, 0, 0]
            }
        };
    }

    /**
     * Triggers the addition of all images found during creation(including header and footer)
     * to the vfs.
     */
    private async loadAllImages(vfs: object): Promise<void> {
        const promises = this.imageUrls.map(image => this.addImageToVfS(image, vfs));
        await Promise.all(promises);
    }

    /**
     * Creates an image in the pdfMake virtual file system, if it doesn't yet exist there
     *
     * @param url
     */
    private async addImageToVfS(url: string, vfs: object): Promise<void> {
        if (url.indexOf(`/`) === 0) {
            url = url.substr(1);
        }

        if (!vfs[url]) {
            const base64 = await this.httpService.downloadAsBase64(url);
            vfs[url] = base64;
        }
    }

    /**
     * Creates the title for the list as pdfmake doc definition
     *
     * @returns The list title for the PDF document
     */
    public createTitle(title: string): object {
        return {
            text: this.translate.instant(title),
            style: `title`
        };
    }

    /**
     * Creates the preamble for the list as pdfmake doc definition
     *
     * @returns The list preamble for the PDF document
     */
    public createPreamble(preamble?: string): object {
        if (preamble) {
            return {
                text: preamble,
                style: `preamble`
            };
        } else {
            return {};
        }
    }

    public getPageBreak(): Object {
        return {
            text: ``,
            pageBreak: `after`
        };
    }

    public getSpacer(): Object {
        return {
            text: ``,
            margin: [0, 5]
        };
    }

    /**
     * Generates the table definition for the TOC
     *
     * @param tocBody the body of the table
     * @returns The table of contents as doc definition
     */
    public createTocTableDef(
        tocBody: object[],
        style: StyleType = StyleType.DEFAULT,
        borderStyle: BorderType = BorderType.DEFAULT,
        ...header: object[]
    ): object {
        return {
            table: {
                headerRows: header[0] ? header.length : 0,
                keepWithHeaderRows: header[0] ? header.length : 0,
                dontBreakRows: true,
                widths: [`auto`, `*`, `auto`],
                body: header[0] ? [...header, ...tocBody] : tocBody
            },
            layout: borderStyle,
            style
        };
    }

    /**
     * Function, that creates a line for the 'Table of contents'
     *
     * @param identifier The identifier/prefix for the line
     * @param title The name of the line
     * @param pageReference Defaults to the page, where the object begins
     * @param style Optional style. Defaults to `'tocEntry'`
     *
     * @returns A line for the toc
     */
    public createTocLine(
        identifier: string,
        title: string,
        pageReference: string,
        style: StyleType = StyleType.DEFAULT,
        ...subTitle: object[]
    ): Object[] {
        return [
            {
                text: identifier,
                style
            },
            {
                text: [title, ...subTitle],
                style: `tocEntry`
            },
            {
                pageReference,
                style: `tocEntry`,
                alignment: `right`
            }
        ];
    }

    /**
     * Function to create an inline line in the toc.
     *
     * @param text The text for the line.
     * @param bold Optional boolean, if the text should be bold - defaults to `false`.
     *
     * @returns {Object} An object for `DocDefinition` for `pdf-make`.
     */
    public createTocLineInline(text: string, italics: boolean = false): Object {
        return {
            text: `\n` + text,
            style: StyleType.SUB_ENTRY,
            italics
        };
    }

    /**
     * Draw a circle on its position on the paper
     *
     * @param y vertical offset
     * @param size the size of the circle
     * @returns an array containing one circle definition for pdfMake
     */
    public drawCircle(y: number, size: number): object[] {
        return [
            {
                type: `ellipse`,
                x: 0,
                y,
                lineColor: `black`,
                r1: size,
                r2: size
            }
        ];
    }
}
