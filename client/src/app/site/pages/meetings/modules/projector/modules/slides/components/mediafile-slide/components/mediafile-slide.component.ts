import { Component } from '@angular/core';
import { IMAGE_MIMETYPES, PDF_MIMETYPES } from 'src/app/site/pages/meetings/pages/mediafiles';

import { BaseSlideComponent } from '../../../base/base-slide-component';
import { SlideMediafileService } from '../../../services/slide-mediafile.service';
import { MediafileSlideData } from '../mediafile-slide-data';

@Component({
    selector: `os-mediafile-slide`,
    templateUrl: `./mediafile-slide.component.html`,
    styleUrls: [`./mediafile-slide.component.scss`]
})
export class MediafileSlideComponent extends BaseSlideComponent<MediafileSlideData> {
    public get url(): string {
        if (this.projector && this.projector.id) {
            const url = this.slideMediafileService.getMediafileSync(this.projector.id, this.data.data.id);

            return url?.data || ``;
        }

        return ``;
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

    public constructor(private slideMediafileService: SlideMediafileService) {
        super();
        (window as any).pdfWorkerSrc = `/assets/pdfworker/pdf.worker.min.js`;
    }
}
