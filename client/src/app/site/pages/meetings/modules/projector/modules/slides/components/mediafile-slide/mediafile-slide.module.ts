import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PipesModule } from 'src/app/ui/pipes';

import { SlideToken } from '../../definitions';
import { MediafileSlideComponent } from './components/mediafile-slide.component';

@NgModule({
    imports: [CommonModule, PipesModule, PdfViewerModule],
    declarations: [MediafileSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: MediafileSlideComponent }]
})
export class MediafileSlideModule {}
