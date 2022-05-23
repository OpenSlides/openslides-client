import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';

import { FileUploadModule } from '../file-upload/file-upload.module';
import { MediaUploadContentComponent } from './components/media-upload-content/media-upload-content.component';

const DECLARATIONS = [MediaUploadContentComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        PipesModule,
        SearchSelectorModule,
        FileUploadModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MediaUploadContentModule {}
