import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SlideToken } from '../../definitions';
import { MediafileSlideComponent } from './components/mediafile-slide.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
    imports: [CommonModule, PdfViewerModule],
    declarations: [MediafileSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: MediafileSlideComponent }]
})
export class MediafileSlideModule {}
