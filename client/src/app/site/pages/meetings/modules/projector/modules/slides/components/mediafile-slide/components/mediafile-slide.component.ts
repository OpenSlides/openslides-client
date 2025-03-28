import { Component, ViewChild } from '@angular/core';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { IMAGE_MIMETYPES, PDF_MIMETYPES } from 'src/app/site/pages/meetings/pages/mediafiles';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';

import { BaseSlideComponent } from '../../../base/base-slide-component';
import { MediafileSlideData } from '../mediafile-slide-data';

@Component({
    selector: `os-mediafile-slide`,
    templateUrl: `./mediafile-slide.component.html`,
    styleUrls: [`./mediafile-slide.component.scss`],
    standalone: false
})
export class MediafileSlideComponent extends BaseSlideComponent<MediafileSlideData> {
    @ViewChild(PdfViewerComponent)
    public pdfViewer: PdfViewerComponent;

    public get url(): string {
        return `/system/media/get/${this.data.data.id}`;
    }

    public get scroll(): number {
        return (this.projector?.scroll || 0) * 100;
    }

    public get zoom(): number {
        return Math.pow(1.1, this.projector?.scale || 0);
    }

    public get page(): number {
        return this.data.options[`page`] || 1;
    }

    public get isImage(): boolean {
        return IMAGE_MIMETYPES.includes(this.data.data.mimetype);
    }

    public get isPdf(): boolean {
        return PDF_MIMETYPES.includes(this.data.data.mimetype);
    }

    public get isFullscreen(): boolean {
        return this.data.options[`fullscreen`] ?? true;
    }

    public pdfLoaded(): void {
        this.updatePdfScroll();
    }

    public constructor() {
        super();
        (window as any).pdfWorkerSrc = new URL(`pdfjs/pdf.worker.min.mjs`, import.meta.url).toString();
    }

    protected override setProjector(value: ViewProjector): void {
        super.setProjector(value);
        if (this.pdfViewer) {
            this.updatePdfScroll();
        }
    }

    private updatePdfScroll(): void {
        this.pdfViewer.pdfViewerContainer.nativeElement.scroll({
            top: this.scroll / 100
        });
    }
}
