import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotionMultiselectActionsComponent } from './components/motion-multiselect-actions/motion-multiselect-actions.component';
import {
    MotionBlockCommonServiceModule,
    MotionSubmitterCommonServiceModule,
    PersonalNoteServiceModule,
    TagCommonServiceModule
} from '../../modules';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';
import { SpinnerModule } from 'src/app/ui/modules/openslides-overlay/modules/spinner';
import { AgendaItemCommonServiceModule } from '../../../agenda/services/agenda-item-common-service.module';
import { MotionsCommonServiceModule } from '../../services/common/motions-service.module';
import { MotionWorkflowCommonServiceModule } from '../../modules/workflows/motion-workflow-common-service.module';

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
        SpinnerModule,
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
