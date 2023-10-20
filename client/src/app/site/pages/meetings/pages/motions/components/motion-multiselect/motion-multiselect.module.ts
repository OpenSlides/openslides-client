import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';

import { AgendaItemCommonServiceModule } from '../../../agenda/services/agenda-item-common-service.module';
import { MotionMultiselectActionsComponent } from './components/motion-multiselect-actions/motion-multiselect-actions.component';
import { MotionMultiselectServiceModule } from './services/motion-multiselect-service.module';

const DECLARATIONS = [MotionMultiselectActionsComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [
        CommonModule,
        MotionMultiselectServiceModule,
        MatIconModule,
        MatDividerModule,
        MatMenuModule,
        ChoiceDialogModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild(),
        AgendaItemCommonServiceModule
    ]
})
export class MotionMultiselectModule {}
