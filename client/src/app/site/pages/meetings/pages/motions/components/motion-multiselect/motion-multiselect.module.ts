import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { GlobalSpinnerModule } from 'src/app/site/modules/global-spinner';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';

import { AgendaItemCommonServiceModule } from '../../../agenda/services/agenda-item-common-service.module';
import {
    MotionBlockCommonServiceModule,
    MotionSubmitterCommonServiceModule,
    PersonalNoteServiceModule,
    TagCommonServiceModule
} from '../../modules';
import { MotionWorkflowCommonServiceModule } from '../../modules/workflows/motion-workflow-common-service.module';
import { MotionsCommonServiceModule } from '../../services/common/motions-service.module';
import { MotionMultiselectActionsComponent } from './components/motion-multiselect-actions/motion-multiselect-actions.component';

const DECLARATIONS = [MotionMultiselectActionsComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [
        CommonModule,
        MotionBlockCommonServiceModule,
        MatIconModule,
        MatDividerModule,
        MatMenuModule,
        ChoiceDialogModule,
        GlobalSpinnerModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild(),
        AgendaItemCommonServiceModule,
        MotionsCommonServiceModule,
        MotionSubmitterCommonServiceModule,
        MotionWorkflowCommonServiceModule,
        TagCommonServiceModule,
        PersonalNoteServiceModule
    ]
})
export class MotionMultiselectModule {}
