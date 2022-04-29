import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { NgxFileDropModule } from 'ngx-file-drop';
import { PblNgridModule } from '@pebula/ngrid';
import { PblNgridMaterialModule } from '@pebula/ngrid-material';
import { PblNgridTargetEventsModule } from '@pebula/ngrid/target-events';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatButtonModule } from '@angular/material/button';

const DECLARATIONS = [FileUploadComponent];
const MODULES = [PblNgridModule, PblNgridMaterialModule, PblNgridTargetEventsModule];

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
