import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MediafileUploadRoutingModule } from './mediafile-upload-routing.module';
import { MediafileUploadComponent } from './components/mediafile-upload/mediafile-upload.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MediaUploadContentModule } from 'src/app/ui/modules/media-upload-content/media-upload-content.module';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { ReactiveFormsModule } from '@angular/forms';
import { PblNgridModule } from '@pebula/ngrid';

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
