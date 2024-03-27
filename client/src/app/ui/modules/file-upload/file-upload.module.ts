import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxFileDropModule } from 'ngx-file-drop';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ScrollingTableModule } from 'src/app/ui/modules/scrolling-table';

import { FileUploadComponent } from './components/file-upload/file-upload.component';

const DECLARATIONS = [FileUploadComponent];
const MODULES = [ScrollingTableModule];

@NgModule({
    declarations: DECLARATIONS,
    exports: [...DECLARATIONS, ...MODULES],
    imports: [
        CommonModule,
        MatCardModule,
        MatProgressBarModule,
        MatIconModule,
        MatTooltipModule,
        MatButtonModule,
        NgxFileDropModule,
        OpenSlidesTranslationModule.forChild(),
        ...MODULES
    ]
})
export class FileUploadModule {}
