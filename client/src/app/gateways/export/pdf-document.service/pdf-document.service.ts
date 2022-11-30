import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { MOTION_PDF_OPTIONS } from 'src/app/domain/models/motions/motions.constants';
import { Functionable } from 'src/app/infrastructure/utils';
import { MediaManageService } from 'src/app/site/pages/meetings/services/media-manage.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { HttpService } from '../../http.service';
import { ExportServiceModule } from '../export-service.module';
import { ProgressSnackBarService } from '../progress-snack-bar/services/progress-snack-bar.service';
import { ProgressSnackBarControlService } from '../progress-snack-bar/services/progress-snack-bar-control.service';
import { PdfImagesService } from './pdf-images.service';

export const PDF_OPTIONS = {
    Toc: `toc`,
    Header: `header`,
    Page: `page`,
    Date: `date`,
    AddBreaks: `addBreaks`
};

export type PDF_CHOOSABLE_OPTIONS = (keyof typeof PDF_OPTIONS)[];

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

    public constructor(public override message: string) {
        super(message);
        const trueProto = new.target.prototype;
        this.__proto__ = trueProto;
    }
}

export interface TocLineDefinition {
    identifier: string;
    title: string;
    pageReference: string;
    style?: StyleType;
}

export interface TocTableDefinition {
    tocBody: object[];
    style?: StyleType;
    borderStyle?: BorderType;
}

interface PaperConfig {
    documentContent: object;
    fontSize: number;
    metadata?: object;
    exportInfo?: object;
    /**
     * Order: left, top, right, bottom
     */
    pageMargins: [number, number, number, number];
    landscape?: boolean;
    /**
     * Defaults to `A4`
     */
    pageSize?: string;
    imageUrls?: string[];
}

export interface DownloadConfig {
    docDefinition: object;
    fontSize: number;
    filename: string;
    loadFonts: Functionable<PdfFontDescription>;
    createVfs?: Functionable<PdfVirtualFileSystem>;
    loadImages?: Functionable<PdfImageDescription>;
    metadata?: object;
    exportInfo?: any;
}

type DocumentPosition = `left` | `center` | `right`;

interface PdfDocumentHeaderConfig {
    logoHeaderLeftUrl?: string;
    logoHeaderRightUrl?: string;
    exportInfo?: any;
    lrMargin: [number, number];
}

interface PdfDocumentFooterConfig {
    exportInfo?: any;
    lrMargin?: [number, number];
    logoFooterLeftUrl?: string;
    logoFooterRightUrl?: string;
    pageNumberPosition?: DocumentPosition;
}

export interface PdfVirtualFileSystem {
    [url: string]: string;
}

export interface PdfImageDescription {
    [url: string]: string;
}

export interface PdfFontDescription {
    normal: string;
    bold: string;
    italics: string;
    bolditalics: string;
}

interface PdfCreatorConfig {
    document: object;
    filename: string;
    progressService: ProgressSnackBarControlService;
    progressSnackBarService: ProgressSnackBarService;
    loadFonts: Functionable<PdfFontDescription>;
    loadImages?: Functionable<PdfImageDescription>;
    createVfs?: Functionable<PdfVirtualFileSystem>;
}

class PdfCreator {
    private readonly _document: object;
    private readonly _filename: string;
    private readonly _loadFonts: Functionable<PdfFontDescription>;
    private readonly _loadImages: Functionable<PdfImageDescription>;
    private readonly _createVfs: Functionable<PdfVirtualFileSystem>;
    private readonly _progressService: ProgressSnackBarControlService;
    private readonly _progressSnackBarService: ProgressSnackBarService;

    private _pdfWorker: Worker | null = null;

    public constructor(config: PdfCreatorConfig) {
        this._document = config.document;
        this._filename = config.filename;
        this._loadFonts = config.loadFonts;
        this._loadImages = config.loadImages || (() => ({}));
        this._createVfs = config.createVfs || (() => ({}));
        this._progressService = config.progressService;
        this._progressSnackBarService = config.progressSnackBarService;
    }

    public download(): void {
        if (this.canDownload()) {
            this.initPdfWorker();
            this.sendDocumentToPdfWorker();
        } else {
            this._pdfWorker = null;
            this._progressSnackBarService.dismiss();
            // this.matSnackBar.open(_(`Cannot create PDF files on this browser.`), ``, {
            //     duration: 0
            // });
        }
    }

    private initPdfWorker(): void {
        this._pdfWorker = new Worker(new URL(`./pdf-worker.worker`, import.meta.url), {
            type: `module`
        });

        // the result of the worker
        this._pdfWorker.onmessage = ({ data }) => {
            // if the worker returns a numbers, is always the progress
            if (typeof data === `number`) {
                // update progress
                const progress = Math.ceil(data * 100);
                this._progressService.progressAmount = progress;
            }

            // if the worker returns an object, it's always the document
            if (typeof data === `object`) {
                this._progressSnackBarService.dismiss();
                saveAs(data, this._filename, { autoBom: true });
                this._pdfWorker = null;
            }
        };
    }

    private async sendDocumentToPdfWorker(): Promise<void> {
        this._pdfWorker!.postMessage({
            doc: JSON.parse(JSON.stringify(this._document)),
            fonts: typeof this._loadFonts === `function` ? await this._loadFonts() : this._loadFonts,
            vfs: await this.createVfs()
        });
    }

    private async createVfs(): Promise<PdfVirtualFileSystem> {
        const fonts = typeof this._loadFonts === `function` ? await this._loadFonts() : this._loadFonts;
        const images = typeof this._loadImages === `function` ? await this._loadImages() : this._loadImages;
        const initialVfs = typeof this._createVfs === `function` ? await this._createVfs() : this._createVfs;
        return {
            ...fonts,
            ...images,
            ...initialVfs
        };
    }

    private canDownload(): boolean {
        const isIE = /msie\s|trident\//i.test(window.navigator.userAgent);
        return typeof Worker !== `undefined` && !isIE;
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
    providedIn: ExportServiceModule
})
export class PdfDocumentService {
    /**
     * A list of all images to add to the virtual file system.
     * May still be filling at header and footer creation
     */
    private imageUrls: string[] = [];

    private pdfWorker: Worker | null = null;

    public constructor(
        private translate: TranslateService,
        private httpService: HttpService,
        // private matSnackBar: MatSnackBar,
        private progressSnackBarService: ProgressSnackBarService,
        private progressService: ProgressSnackBarControlService,
        private pdfImagesService: PdfImagesService,
        private mediaManageService: MediaManageService,
        private meetingSettingsService: MeetingSettingsService
    ) {}

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
    public createPreamble(preamble: string | null): object {
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
     * @returns The table of contents as doc definition
     */
    public createTocTableDef(
        { tocBody, style = StyleType.DEFAULT, borderStyle = BorderType.DEFAULT }: TocTableDefinition,
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
     * @returns A line for the toc
     */
    public createTocLine(
        { identifier, title, pageReference, style = StyleType.DEFAULT }: TocLineDefinition,
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
     * @param italics Optional boolean, if the text should be italic - defaults to `false`.
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

    /**
     * Downloads a pdf with the standard page definitions.
     */
    public download({
        docDefinition,
        filename: filetitle,
        ...config
    }: DownloadConfig & { pageMargins: [number, number, number, number] }): void {
        this.showProgress();
        const imageUrls = this.pdfImagesService.getImageUrls();
        this.pdfImagesService.clearImageUrls();
        new PdfCreator({
            ...config,
            document: this.getStandardPaper({
                ...config,
                documentContent: docDefinition,
                pageMargins: config.pageMargins,
                landscape: false,
                imageUrls: imageUrls
            }),
            filename: `${filetitle}.pdf`,
            loadImages: () => this.loadImages(),
            progressService: this.progressService,
            progressSnackBarService: this.progressSnackBarService
        }).download();
    }

    /**
     * Downloads a pdf in landscape orientation
     */
    public downloadLandscape({ docDefinition, filename: filetitle, ...config }: DownloadConfig): void {
        this.showProgress();
        new PdfCreator({
            ...config,
            document: this.getStandardPaper({
                ...config,
                documentContent: docDefinition,
                pageMargins: [50, 80, 50, 75],
                landscape: true
            }),
            filename: `${filetitle}.pdf`,
            loadImages: () => this.loadImages(),
            progressService: this.progressService,
            progressSnackBarService: this.progressSnackBarService
        }).download();
    }

    public downloadWaitableDoc(
        filetitle: string,
        buildDocFn: () => Promise<object>,
        loadFonts: () => Promise<PdfFontDescription>,
        createVfs: () => Promise<PdfVirtualFileSystem>
    ): void {
        this.showProgress();
        buildDocFn().then(document =>
            new PdfCreator({
                document,
                filename: `${filetitle}.pdf`,
                loadFonts,
                createVfs: createVfs,
                loadImages: () => this.loadImages(),
                progressService: this.progressService,
                progressSnackBarService: this.progressSnackBarService
            }).download()
        );
    }

    /**
     * Overall document definition and styles for the most PDF documents
     *
     * @returns the pdf document definition ready to export
     */
    private getStandardPaper({
        documentContent,
        pageMargins,
        exportInfo,
        landscape,
        metadata,
        pageSize = `A4`,
        fontSize,
        imageUrls
    }: PaperConfig): object {
        this.imageUrls = imageUrls ? imageUrls : [];
        const result = {
            pageSize,
            pageOrientation: landscape ? `landscape` : `portrait`,
            pageMargins,
            defaultStyle: {
                font: `PdfFont`,
                fontSize
            },
            header: this.getHeader({ exportInfo: exportInfo, lrMargin: [pageMargins[0], pageMargins[2]] }),
            // real footer gets created in the worker
            tmpfooter: this.getFooter({
                lrMargin: pageMargins ? [pageMargins[0], pageMargins[2]] : undefined,
                exportInfo
            }),
            info: metadata,
            content: documentContent,
            styles: this.getStandardPaperStyles(pageSize)
        };
        return result;
    }

    /**
     * Creates the header doc definition for normal PDF documents
     *
     * @param lrMargin optional margin overrides
     * @returns an object that contains the necessary header definition
     */
    private getHeader({ exportInfo, lrMargin }: PdfDocumentHeaderConfig): object {
        let text: string;
        const columns = [];
        let logoHeaderLeftUrl = this.mediaManageService.getLogoUrl(`pdf_header_l`);
        let logoHeaderRightUrl = this.mediaManageService.getLogoUrl(`pdf_header_r`);
        const header =
            exportInfo && exportInfo.pdfOptions ? exportInfo.pdfOptions.includes(MOTION_PDF_OPTIONS.Header) : false;

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

        // Add no heading text if there are logos on the right and left.
        if (header && !(logoHeaderRightUrl && logoHeaderLeftUrl)) {
            const name = this.translate.instant(this.meetingSettingsService.instant(`name`));
            const description = this.translate.instant(this.meetingSettingsService.instant(`description`));
            const location = this.meetingSettingsService.instant(`location`);
            const start_time = this.meetingSettingsService.instant(`start_time`);
            const end_time = this.meetingSettingsService.instant(`end_time`);
            const start_date = start_time
                ? new Date(start_time * 1000).toLocaleDateString(this.translate.currentLang)
                : ``;
            const end_date = end_time ? new Date(end_time * 1000).toLocaleDateString(this.translate.currentLang) : ``;
            const date = [start_date, end_date].filter(Boolean).join(` - `);
            const line1 = [name, description].filter(Boolean).join(` - `);
            const line2 = [location, date].filter(Boolean).join(`, `);
            text = [line1, line2].join(`\n`);
        } else {
            text = ``;
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
        const margin = [lrMargin ? lrMargin[0] : 75, 30, lrMargin ? lrMargin[0] : 75, 10];
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
     * @param lrMargin optionally overriding the margins
     * @returns the footer doc definition
     */
    private getFooter({ exportInfo, lrMargin, pageNumberPosition: numberPosition }: PdfDocumentFooterConfig): object {
        const columns = [];
        const showPageNr = exportInfo && exportInfo.pdfOptions ? exportInfo.pdfOptions.includes(`page`) : true;
        const showDate = exportInfo && exportInfo.pdfOptions ? exportInfo.pdfOptions.includes(`date`) : false;
        let logoContainerWidth: string;
        let pageNumberPosition: string;
        let logoContainerSize: number[];
        let logoFooterLeftUrl = this.mediaManageService.getLogoUrl(`pdf_footer_l`);
        let logoFooterRightUrl = this.mediaManageService.getLogoUrl(`pdf_footer_r`);

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
            pageNumberPosition = numberPosition!;
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
        this.progressSnackBarService
            .open({
                duration: 0
            })
            .then(progressBarRef => {
                // Listen to clicks on the cancel button
                progressBarRef.onAction().subscribe(() => {
                    this.cancelPdfCreation();
                });
            });

        this.progressService.message = this.translate.instant(`Creating PDF file ...`);
        this.progressService.progressMode = `determinate`;
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
    private getStandardPaperStyles(pageSize: string): object {
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
     * Triggers the addition of all images found during creation(including header and footer)
     * to the vfs.
     */
    private async loadImages(): Promise<PdfImageDescription> {
        const urls = this.imageUrls.map(image => {
            return image.indexOf(`/`) === 0 ? image.slice(1) : image;
        });
        const images = await Promise.all(urls.map(url => this.httpService.downloadAsBase64(url)));
        return urls.mapToObject((url, index) => ({ [url]: images[index] }));
    }
}
