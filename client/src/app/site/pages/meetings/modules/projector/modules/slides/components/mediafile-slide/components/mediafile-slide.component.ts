import { Component } from '@angular/core';
import { IMAGE_MIMETYPES, PDF_MIMETYPES } from 'src/app/site/pages/meetings/pages/mediafiles';

import { BaseSlideComponent } from '../../../base/base-slide-component';
import { MediafileSlideData } from '../mediafile-slide-data';

@Component({
    selector: `os-mediafile-slide`,
    templateUrl: `./mediafile-slide.component.html`,
    styleUrls: [`./mediafile-slide.component.scss`]
})
export class MediafileSlideComponent extends BaseSlideComponent<MediafileSlideData> {
    public get url(): string {
        return `/system/media/get/${this.data.data.id}`;
    }

    public get zoom(): number {
        return Math.pow(1.1, this.data.options[`zoom`] || 0);
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

    public constructor() {
        super();
        (window as any).pdfWorkerSrc = `/assets/pdfworker/pdf.worker.min.js`;
    }
}
