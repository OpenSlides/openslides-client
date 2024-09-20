import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { AgendaContentObjectFormModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector/agenda-content-object-form/agenda-content-object-form.module';
import { AttachmentControlModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector/attachment-control';
import { DetailViewModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector/detail-view/detail-view.module';
import { DirectivesModule } from 'src/app/ui/directives';
import { EditorModule } from 'src/app/ui/modules/editor';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { PipesModule } from 'src/app/ui/pipes';

import { MotionDetailDirectivesModule } from '../../modules/directives/motion-detail-directives.module';
import { AmendmentCreateWizardComponent } from './components/amendment-create-wizard/amendment-create-wizard.component';
import { MotionFormComponent } from './components/motion-form/motion-form.component';
import { ParagraphBasedAmendmentEditorComponent } from './components/paragraph-based-amendment-editor/paragraph-based-amendment-editor.component';
import { MotionFormRoutingModule } from './motion-form-routing.module';

@NgModule({
    declarations: [MotionFormComponent, ParagraphBasedAmendmentEditorComponent, AmendmentCreateWizardComponent],
    imports: [
        CommonModule,
        MotionFormRoutingModule,
        DirectivesModule,
        PipesModule,
        MotionDetailDirectivesModule,
        AgendaContentObjectFormModule,
        HeadBarModule,
        DetailViewModule,
        AttachmentControlModule,
        EditorModule,
        SearchSelectorModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        OpenSlidesTranslationModule.forChild(),

        // Amendment create wizard
        ScrollingModule,
        MatStepperModule,
        MatRadioModule,
        MatCheckboxModule
    ]
})
export class MotionFormModule {}
