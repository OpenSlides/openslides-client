import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaUploadContentComponent } from './components/media-upload-content/media-upload-content.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { MatInputModule } from '@angular/material/input';

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
