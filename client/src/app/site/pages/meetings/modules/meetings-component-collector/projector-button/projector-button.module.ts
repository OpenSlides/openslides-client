import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';

import { ProjectionDialogModule } from '../projection-dialog/projection-dialog.module';
import { ProjectorButtonComponent } from './components/projector-button/projector-button.component';

const DECLARATIONS = [ProjectorButtonComponent];

@NgModule({
    exports: DECLARATIONS,
    declarations: DECLARATIONS,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild(),
        ProjectionDialogModule
    ]
})
export class ProjectorButtonModule {}
