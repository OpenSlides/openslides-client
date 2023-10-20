import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { MediaUploadContentModule } from 'src/app/ui/modules/media-upload-content/media-upload-content.module';
import { ScrollingTableModule } from 'src/app/ui/modules/scrolling-table';
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
        ScrollingTableModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class AttachmentControlModule {}
