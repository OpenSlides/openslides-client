import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import {
    Alignment,
    Content,
    ContentColumns,
    ContentImage,
    ContentSvg,
    ContentTable,
    ContentText,
    Margins,
    PageOrientation,
    PageSize,
    StyleDictionary,
    TableCell,
    TDocumentDefinitions
} from 'pdfmake/interfaces';
import { Settings } from 'src/app/domain/models/meetings/meeting';
import { MOTION_PDF_OPTIONS } from 'src/app/domain/models/motions/motions.constants';
import { Functionable } from 'src/app/infrastructure/utils';
import { Deferred } from 'src/app/infrastructure/utils/promises';
import { MediaManageService } from 'src/app/site/pages/meetings/services/media-manage.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { HttpService } from '../../http.service';
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
    fillColor?: string;
}

export interface TocTableDefinition {
    tocBody: TableCell[][];
    style?: StyleType;
    borderStyle?: BorderType;
}

interface PaperConfig {
    documentContent: Content;
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
    pageSize?: PageSize;
    imageUrls?: string[];
}

export interface DownloadConfig {
    docDefinition: Content;
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

export type PdfVirtualFileSystem = Record<string, string>;

export interface PdfImageDescription {
    images?: Record<string, string>;
    svgs?: Record<string, string>;
}

export interface PdfFontDescription {
    normal: string;
    bold: string;
    italics: string;
    bolditalics: string;
}

const additionalPdfSettingsKeys: (keyof Settings)[] = [`export_pdf_pagenumber_alignment`];

interface PdfCreatorConfig {
    document: TDocumentDefinitions;
    filename: string;
    progressService: ProgressSnackBarControlService;
    progressSnackBarService: ProgressSnackBarService;
    settings?: Partial<Settings>;
    loadFonts: Functionable<PdfFontDescription>;
    loadImages?: Functionable<PdfImageDescription>;
    createVfs?: Functionable<PdfVirtualFileSystem>;
}

class PdfCreator {
    private readonly _document: TDocumentDefinitions;
    private readonly _filename: string;
    private readonly _loadFonts: Functionable<PdfFontDescription>;
    private readonly _loadImages: Functionable<PdfImageDescription>;
    private readonly _createVfs: Functionable<PdfVirtualFileSystem>;
    private readonly _progressService: ProgressSnackBarControlService;
    private readonly _progressSnackBarService: ProgressSnackBarService;
    private readonly _settings: Partial<Settings>;

    private _pdfWorker: Worker | null = null;

    public constructor(config: PdfCreatorConfig) {
        this._document = config.document;
        this._filename = config.filename;
        this._loadFonts = config.loadFonts;
        this._loadImages = config.loadImages || ((): any => ({}));
        this._createVfs = config.createVfs || ((): any => ({}));
        this._progressService = config.progressService;
        this._progressSnackBarService = config.progressSnackBarService;
        this._settings = config.settings;
    }

    public async getFile(): Promise<Blob | null> {
        if (this.canDownload()) {
            const filePromise = this.subscribePdfWorker();
            this.sendDocumentToPdfWorker();

            const file = await filePromise;
            return file;
        }

        this._pdfWorker = null;
        this._progressSnackBarService.dismiss();
        return null;
    }

    public async download(): Promise<void> {
        const file = await this.getFile();
        if (file !== null) {
            saveAs(file, this._filename, { autoBom: true });
            return;
        }

        this._pdfWorker = null;
        this._progressSnackBarService.dismiss();
    }

    private subscribePdfWorker(): Promise<Blob> {
        const result = new Deferred<Blob>();
        this._pdfWorker = new Worker(new URL(`./pdf-worker.worker`, import.meta.url), {
            type: `module`
        });

        // the result of the worker
        this._pdfWorker.onmessage = ({ data }): void => {
            // if the worker returns a numbers, is always the progress
            if (typeof data === `number` && this._progressService && this._progressSnackBarService) {
                // update progress
                const progress = Math.ceil(data * 100);
                this._progressService.progressAmount = progress;
            }

            // if the worker returns an object, it's always the document
            if (typeof data === `object`) {
                this._progressSnackBarService?.dismiss();
                result.resolve(data);
                this._pdfWorker = null;
            }
        };

        return result;
    }

    private async sendDocumentToPdfWorker(): Promise<void> {
        const fonts = typeof this._loadFonts === `function` ? await this._loadFonts() : this._loadFonts;
        const images = typeof this._loadImages === `function` ? await this._loadImages() : this._loadImages;

        let doc = JSON.parse(JSON.stringify(this._document));
        if (images.svgs) {
            doc = this.replaceSvgImages(doc, images.svgs);
        }

        this._pdfWorker!.postMessage({
            doc,
            fonts: typeof this._loadFonts === `function` ? await this._loadFonts() : this._loadFonts,
            vfs: await this.createVfs(fonts, images),
            settings: this._settings
        });
    }

    private replaceSvgImages(doc: any, images: object): any {
        for (const url of Object.keys(images)) {
            doc = this.replaceSvgRecursive(doc, url, images[url]);
        }

        return doc;
    }

    private replaceSvgRecursive(doc: any, url: string, image: string): any {
        if (Array.isArray(doc)) {
            return doc.map(el => {
                return this.replaceSvgRecursive(el, url, image);
            });
        } else if (doc && typeof doc === `object`) {
            for (const key of Object.keys(doc)) {
                if (key === `image` && (doc[key] === url || doc[key] === `/` + url)) {
                    delete doc[key];
                    doc.svg = image;
                } else {
                    doc[key] = this.replaceSvgRecursive(doc[key], url, image);
                }
            }
        }

        return doc;
    }

    private async createVfs(fonts: PdfFontDescription, images: PdfImageDescription): Promise<PdfVirtualFileSystem> {
        const initialVfs = typeof this._createVfs === `function` ? await this._createVfs() : this._createVfs;
        return {
            ...fonts,
            ...images?.images,
            ...initialVfs
        };
    }

    private canDownload(): boolean {
        const isIE = /msie\s|trident\//i.test(window.navigator.userAgent);
        return typeof Worker !== `undefined` && !isIE;
    }
}

export interface HeaderLogos {
    place: string;
    isSVG: boolean;
    content: string;
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

    private headerLogos: Record<string, HeaderLogos | null> = {};

    private pdfWorker: Worker | null = null;

    private settings: Partial<Settings> = {};

    public constructor(
        private translate: TranslateService,
        private httpService: HttpService,
        // private matSnackBar: MatSnackBar,
        private progressSnackBarService: ProgressSnackBarService,
        private progressService: ProgressSnackBarControlService,
        private pdfImagesService: PdfImagesService,
        private mediaManageService: MediaManageService,
        private meetingSettingsService: MeetingSettingsService
    ) {
        this.makeSettingsSubscriptions();
    }

    private async updateHeader(places: any): Promise<void> {
        for (const place of places) {
            const url = this.mediaManageService.getLogoUrl(place);
            if (url) {
                const fetchResult = await fetch(url);
                const svg = fetchResult.headers.get(`content-type`).includes(`image/svg+xml`);
                if (svg) {
                    const text = await fetchResult.text();

                    if (text.length >= 1) {
                        const start = text.indexOf(`<svg`);
                        const restText = text.slice(start + 5);
                        const viewBox = this.getViewBox(text);
                        const svgText = [`<svg `, viewBox, restText].join(``);
                        this.headerLogos[place] = {
                            place: place,
                            isSVG: true,
                            content: svgText
                        };
                    }
                } else {
                    this.headerLogos[place] = {
                        place: place,
                        isSVG: false,
                        content: url
                    };
                }
            } else {
                this.headerLogos[place] = null;
            }
        }
    }

    private getViewBox(text: string): string {
        const width: number = this.getSizeValue(text, `width="`);
        const height: number = this.getSizeValue(text, `height="`);
        if (width !== -1 && height !== -1) {
            return ` viewBox=" 0 0 ` + (width + 100) + ` ` + (height + 100) + `" `;
        }
        return ``;
    }

    private getSizeValue(text: string, param: string): number {
        const REGEX = /\d+/g;
        if (text.search(param) !== -1) {
            const indexStart = text.indexOf(param);
            const indexEnd = text.indexOf(`"`, indexStart + param.length);
            const value = Number(text.substring(indexStart + 7, indexEnd).match(REGEX)[0]);
            return value;
        }
        return -1;
    }

    private makeSettingsSubscriptions(): void {
        additionalPdfSettingsKeys.forEach(key =>
            this.meetingSettingsService
                .get(key)
                .subscribe(value => (this.settings = Object.assign(this.settings, { [key]: value })))
        );
    }

    /**
     * Removes leading slash from url.
     *
     * @returns Url without leading slash
     */

    private removeLeadingSlash(url: string): string {
        if (url.indexOf(`/`) === 0) {
            url = url.substr(1); // remove leading `/`
        }
        return url;
    }

    /**
     * Creates the title for the list as pdfmake doc definition
     *
     * @returns The list title for the PDF document
     */
    public createTitle(title: string): ContentText {
        return {
            text: title,
            style: `title`
        };
    }

    /**
     * Creates the preamble for the list as pdfmake doc definition
     *
     * @returns The list preamble for the PDF document
     */
    public createPreamble(preamble: string | null): Content {
        if (preamble) {
            return {
                text: preamble,
                style: `preamble`
            };
        } else {
            return [];
        }
    }

    public getPageBreak(): ContentText {
        return {
            text: ``,
            pageBreak: `after`
        };
    }

    public getSpacer(): ContentText {
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
        ...header: TableCell[][]
    ): ContentTable {
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
        { identifier, title, pageReference, style = StyleType.DEFAULT, fillColor = `` }: TocLineDefinition,
        ...subTitle: Content[]
    ): Content[] {
        return [
            {
                text: identifier,
                fillColor,
                style
            },
            {
                text: [title, ...subTitle],
                style: `tocEntry`,
                fillColor
            },
            {
                pageReference,
                style: `tocEntry`,
                alignment: `right`,
                fillColor
            }
        ];
    }

    /**
     * Function to create an inline line in the toc.
     *
     * @param text The text for the line.
     * @param italics Optional boolean, if the text should be italic - defaults to `false`.
     *
     * @returns {Content} An object for `DocDefinition` for `pdf-make`.
     */
    public createTocLineInline(text: string, italics = false): Content {
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
     * Returns a Blob of a pdf with the standard page definitions.
     */
    public async blob({
        docDefinition,
        filename: filetitle,
        disableProgress,
        ...config
    }: DownloadConfig & {
        pageMargins: [number, number, number, number];
        pageSize: PageSize;
        disableProgress?: boolean;
        progressService?: ProgressSnackBarControlService;
    }): Promise<Blob | null> {
        await this.updateHeader([`pdf_header_l`, `pdf_header_r`, `pdf_footer_l`, `pdf_footer_r`]);

        if (!disableProgress) {
            this.showProgress();
        }
        const imageUrls = this.pdfImagesService.getImageUrls();
        this.pdfImagesService.clearImageUrls();
        return new PdfCreator({
            document: this.getStandardPaper({
                ...config,
                documentContent: docDefinition,
                pageMargins: config.pageMargins,
                pageSize: config.pageSize,
                landscape: false,
                imageUrls: imageUrls
            }),
            filename: `${filetitle}.pdf`,
            settings: this.settings,
            loadImages: (): Promise<PdfImageDescription> => this.loadImages(),
            progressService: null,
            progressSnackBarService: !disableProgress ? this.progressSnackBarService : undefined,
            ...config
        }).getFile();
    }

    /**
     * Downloads a pdf with the standard page definitions.
     */
    public async download(
        config: DownloadConfig & { pageMargins: [number, number, number, number]; pageSize: PageSize }
    ): Promise<void> {
        const file = await this.blob({
            ...config,
            progressService: this.progressService
        });
        if (file) {
            saveAs(file, config.filename, { autoBom: true });
        }
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
            settings: this.settings,
            loadImages: (): Promise<PdfImageDescription> => this.loadImages(),
            progressService: this.progressService,
            progressSnackBarService: this.progressSnackBarService
        }).download();
    }

    public downloadWaitableDoc(
        filetitle: string,
        buildDocFn: () => Promise<TDocumentDefinitions>,
        loadFonts: () => Promise<PdfFontDescription>,
        createVfs: () => Promise<PdfVirtualFileSystem>
    ): void {
        this.showProgress();

        let logoBallotPaperUrl = this.mediaManageService.getLogoUrl(`pdf_ballot_paper`);
        if (logoBallotPaperUrl) {
            logoBallotPaperUrl = this.removeLeadingSlash(logoBallotPaperUrl);
            this.imageUrls.push(logoBallotPaperUrl);
        }

        buildDocFn().then(document =>
            new PdfCreator({
                document,
                filename: `${filetitle}.pdf`,
                settings: this.settings,
                loadFonts,
                createVfs: createVfs,
                loadImages: (): Promise<PdfImageDescription> => this.loadImages(),
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
    }: PaperConfig): TDocumentDefinitions {
        this.imageUrls = imageUrls ? imageUrls : [];
        const pageOrientation: PageOrientation = landscape ? `landscape` : `portrait`;
        const result = {
            version: `1.5`,
            subset: `PDF/A-3a`,
            pageSize,
            pageOrientation,
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
        return result as TDocumentDefinitions;
    }

    /**
     * Creates the header doc definition for normal PDF documents
     *
     * @param lrMargin optional margin overrides
     * @returns an object that contains the necessary header definition
     */
    private getHeader({ exportInfo, lrMargin }: PdfDocumentHeaderConfig): ContentColumns {
        let text: string;
        const columns: Content = [];
        const logoHeaderLeft = this.headerLogos[`pdf_header_l`];
        const logoHeaderRight = this.headerLogos[`pdf_header_r`];

        const header =
            exportInfo && exportInfo.pdfOptions ? exportInfo.pdfOptions.includes(MOTION_PDF_OPTIONS.Header) : true;

        // add the left logo to the header column
        if (logoHeaderLeft) {
            if (logoHeaderLeft.isSVG) {
                columns.push(
                    this.getSVG({
                        image: logoHeaderLeft.content,
                        fit: [180, 40],
                        width: `20%`
                    })
                );
            } else {
                columns.push(
                    this.getImage({
                        image: logoHeaderLeft.content,
                        fit: [180, 40],
                        width: `20%`
                    })
                );
            }
        }

        // Add no heading text if there are logos on the right and left.
        if (header && !(logoHeaderRight && logoHeaderLeft)) {
            const name = this.meetingSettingsService.instant(`name`);
            const description = this.meetingSettingsService.instant(`description`);
            const location = this.meetingSettingsService.instant(`location`);
            const start_time = this.meetingSettingsService.instant(`start_time`);
            const end_time = this.meetingSettingsService.instant(`end_time`);
            const start_date = start_time
                ? new Date(start_time * 1000).toLocaleDateString(this.translate.getCurrentLang())
                : ``;
            const end_date = end_time
                ? new Date(end_time * 1000).toLocaleDateString(this.translate.getCurrentLang())
                : ``;
            const date = start_date !== end_date ? [start_date, end_date].filter(Boolean).join(` - `) : start_date;
            const line1 = [name, description].filter(Boolean).join(` - `);
            const line2 = [location, date].filter(Boolean).join(`, `);
            text = [line1, line2].join(`\n`);
        } else {
            text = ``;
        }
        columns.push({
            text,
            style: `headerText`,
            alignment: logoHeaderRight ? `left` : `right`
        });

        // add the logo to the right
        // add the left logo to the header column
        if (logoHeaderRight) {
            if (logoHeaderRight.isSVG) {
                columns.push(
                    this.getSVG({
                        image: logoHeaderRight.content,
                        fit: [180, 40],
                        alignment: `right`,
                        width: `20%`
                    })
                );
            } else {
                columns.push(
                    this.getImage({
                        image: logoHeaderRight.content,
                        fit: [180, 40],
                        alignment: `right`,
                        width: `20%`
                    })
                );
            }
        }
        const margin: Margins = [lrMargin ? lrMargin[0] : 75, 30, lrMargin ? lrMargin[0] : 75, 10];
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
        let logoContainerSize: [number, number];
        const logoFooterLeft = this.headerLogos[`pdf_footer_l`];
        const logoFooterRight = this.headerLogos[`pdf_footer_r`];

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
                    this.translate.getCurrentLang()
                )}`,
                fontSize: 6
            };
        }

        // if there is a single logo, give it a lot of space
        if (logoFooterLeft && logoFooterRight) {
            logoContainerWidth = `20%`;
            logoContainerSize = [180, 40];
        } else {
            logoContainerWidth = `80%`;
            logoContainerSize = [400, 50];
        }

        // the position of the page number depends on the logos
        if (logoFooterLeft && logoFooterRight) {
            pageNumberPosition = `center`;
        } else if (logoFooterLeft && !logoFooterRight) {
            pageNumberPosition = `right`;
        } else if (logoFooterRight && !logoFooterLeft) {
            pageNumberPosition = `left`;
        } else {
            pageNumberPosition = numberPosition!;
        }

        // add the left footer logo, if any
        if (logoFooterLeft) {
            if (logoFooterLeft.isSVG) {
                columns.push(
                    this.getSVG({
                        image: logoFooterLeft.content,
                        fit: logoContainerSize,
                        width: logoContainerWidth
                    })
                );
            } else {
                columns.push(
                    this.getImage({
                        image: logoFooterLeft.content,
                        fit: logoContainerSize,
                        width: logoContainerWidth
                    })
                );
            }
        }

        // add the page number
        columns.push({
            stack: [footerPageNumber, footerDate],
            style: `footerPageNumber`,
            alignment: pageNumberPosition
        });

        // add the right footer logo, if any
        if (logoFooterRight) {
            if (logoFooterRight.isSVG) {
                columns.push(
                    this.getSVG({
                        image: logoFooterRight.content,
                        fit: logoContainerSize,
                        alignment: `right`,
                        width: logoContainerWidth
                    })
                );
            } else {
                columns.push(
                    this.getImage({
                        image: logoFooterRight.content,
                        fit: logoContainerSize,
                        alignment: `right`,
                        width: logoContainerWidth
                    })
                );
            }
        }

        const margin = [lrMargin ? lrMargin[0] : 75, 0, lrMargin ? lrMargin[0] : 75, 10];
        return {
            margin,
            columns,
            columnGap: 10
        };
    }

    private getImage(data: {
        image: string;
        fit?: [number, number];
        width?: any;
        alignment?: Alignment;
    }): ContentImage {
        this.imageUrls.push(data.image);
        return {
            image: this.removeLeadingSlash(data.image),
            fit: data.fit,
            width: data.width,
            alignment: data.alignment
        };
    }

    private getSVG(data: { image: string; fit?: [number, number]; width?: any; alignment?: Alignment }): ContentSvg {
        return {
            svg: data.image,
            fit: data.fit,
            width: data.width,
            alignment: data.alignment
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
                this.progressService.message = this.translate.instant(`Creating PDF file ...`);
                this.progressService.progressMode = `determinate`;
            });
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
    private getStandardPaperStyles(pageSize: PageSize): StyleDictionary {
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
        const downloads = await Promise.all(urls.map(url => this.httpService.downloadAsBase64(url)));
        const images = downloads.filter(image => image.type !== `image/svg+xml`);
        const svgs = downloads.filter(image => image.type === `image/svg+xml`);

        return {
            images: urls
                .filter((_, index) => downloads[index].type !== `image/svg+xml`)
                .mapToObject((url, index) => ({ [url]: images[index].data })),
            svgs: urls
                .filter((_, index) => downloads[index].type === `image/svg+xml`)
                .mapToObject((url, index) => ({ [url]: atob(svgs[index].data) }))
        };
    }
}
