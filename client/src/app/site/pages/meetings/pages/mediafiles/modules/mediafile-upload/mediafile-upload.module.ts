import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PblNgridModule } from '@pebula/ngrid';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MediaUploadContentModule } from 'src/app/ui/modules/media-upload-content/media-upload-content.module';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';

import { MediafileUploadComponent } from './components/mediafile-upload/mediafile-upload.component';
import { MediafileUploadRoutingModule } from './mediafile-upload-routing.module';

@NgModule({
    declarations: [MediafileUploadComponent],
    imports: [
        CommonModule,
        MediafileUploadRoutingModule,
        MatMenuModule,
        MatIconModule,
        MatCardModule,
        MatFormFieldModule,
        PblNgridModule,
        ReactiveFormsModule,
        HeadBarModule,
        MediaUploadContentModule,
        SearchSelectorModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MediafileUploadModule {}
