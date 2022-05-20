import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { MediaUploadContentModule } from 'src/app/ui/modules/media-upload-content/media-upload-content.module';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';

import { MediafileCommonServiceModule } from '../../../pages/mediafiles/services/mediafile-common-service.module';
import { AttachmentControlComponent } from './components/attachment-control/attachment-control.component';

const DECLARATIONS = [AttachmentControlComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        ReactiveFormsModule,
        SearchSelectorModule,
        MediaUploadContentModule,
        MediafileCommonServiceModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class AttachmentControlModule {}
