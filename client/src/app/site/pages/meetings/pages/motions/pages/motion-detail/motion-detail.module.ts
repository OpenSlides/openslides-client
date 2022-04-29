import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MotionDetailRoutingModule } from './motion-detail-routing.module';
import { MotionDetailComponent } from './components/motion-detail/motion-detail.component';
import { MotionDetailViewComponent } from './components/motion-detail-view/motion-detail-view.component';
import { AmendmentCreateWizardComponent } from './components/amendment-create-wizard/amendment-create-wizard.component';
import { RouterModule } from '@angular/router';
import { MotionContentComponent } from './components/motion-content/motion-content.component';
import { MotionMetaDataComponent } from './components/motion-meta-data/motion-meta-data.component';
import { MotionManageTitleComponent } from './components/motion-manage-title/motion-manage-title.component';
import { MotionManagePollsComponent } from './components/motion-manage-polls/motion-manage-polls.component';
import { MotionHighlightFormComponent } from './components/motion-highlight-form/motion-highlight-form.component';
import { MotionExtensionFieldComponent } from './components/motion-extension-field/motion-extension-field.component';
import { MotionManageSubmittersComponent } from './components/motion-manage-submitters/motion-manage-submitters.component';
import { MotionDetailDiffComponent } from './components/motion-detail-diff/motion-detail-diff.component';
import { MotionDetailOriginalChangeRecommendationsComponent } from './components/motion-detail-original-change-recommendations/motion-detail-original-change-recommendations.component';
import { MotionCommentsComponent } from './components/motion-comments/motion-comments.component';
import { MotionPersonalNoteComponent } from './components/motion-personal-note/motion-personal-note.component';
import { MotionCommentComponent } from './components/motion-comment/motion-comment.component';
import { MatDividerModule } from '@angular/material/divider';
import { DirectivesModule } from 'src/app/ui/directives';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MotionChangeRecommendationDialogModule } from './modules/motion-change-recommendation-dialog/motion-change-recommendation-dialog.module';
import { MatChipsModule } from '@angular/material/chips';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';
import { SortingModule } from 'src/app/ui/modules/sorting';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { ActionCardModule } from 'src/app/ui/modules/action-card';
import { EditorModule } from 'src/app/ui/modules/editor';
import { MotionPollModule } from '../../modules/motion-poll';
import { MotionDetailDirectivesModule } from './modules/directives/motion-detail-directives.module';
import { MotionsCommonServiceModule } from '../../services/common/motions-service.module';
import { MotionForwardDialogModule } from '../../components/motion-forward-dialog/motion-forward-dialog.module';
import { MotionDetailServiceModule } from './services/motion-detail-service.module';
import { AgendaItemCommonServiceModule } from '../../../agenda/services/agenda-item-common-service.module';
import { MotionsListServiceModule } from '../../services/list/motions-list-service.module';
import { MotionsExportModule } from '../../services/export/motions-export.module';
import { ParticipantCommonServiceModule } from '../../../participants/services/common/participant-common-service.module';
import { MotionFinalVersionComponent } from './components/motion-final-version/motion-final-version.component';
import { ParagraphBasedAmendmentComponent } from './components/paragraph-based-amendment/paragraph-based-amendment.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { AttachmentControlModule } from '../../../../modules/meetings-component-collector/attachment-control/attachment-control.module';
import { MatCardModule } from '@angular/material/card';
import { MotionSubmitterCommonServiceModule } from '../../modules/submitters/motion-submitter-common-service.module';
import { PersonalNoteServiceModule } from '../../modules';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatBadgeModule } from '@angular/material/badge';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MotionParagraphbasedAmendmentComponent } from './components/motion-paragraphbased-amendment/motion-paragraphbased-amendment.component';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';

@NgModule({
    declarations: [
        MotionDetailComponent,
        MotionDetailViewComponent,
        AmendmentCreateWizardComponent,
        MotionContentComponent,
        MotionMetaDataComponent,
        MotionManageTitleComponent,
        MotionManagePollsComponent,
        MotionHighlightFormComponent,
        MotionExtensionFieldComponent,
        MotionManageSubmittersComponent,
        MotionParagraphbasedAmendmentComponent,
        MotionDetailDiffComponent,
        MotionDetailOriginalChangeRecommendationsComponent,
        MotionCommentsComponent,
        MotionPersonalNoteComponent,
        MotionCommentComponent,
        MotionFinalVersionComponent,
        ParagraphBasedAmendmentComponent
    ],
    imports: [
        CommonModule,
        MotionDetailRoutingModule,
        MotionChangeRecommendationDialogModule,
        MotionPollModule,
        MotionDetailDirectivesModule,
        MotionDetailServiceModule,
        MotionForwardDialogModule,
        MotionsCommonServiceModule,
        MotionsListServiceModule,
        MotionsExportModule,
        AgendaItemCommonServiceModule,
        ParticipantCommonServiceModule,
        ChoiceDialogModule,
        DirectivesModule,
        PipesModule,
        IconContainerModule,
        SortingModule,
        SearchSelectorModule,
        EditorModule,
        ActionCardModule,
        HeadBarModule,
        AttachmentControlModule,
        MeetingsComponentCollectorModule,
        OpenSlidesTranslationModule.forChild(),
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatChipsModule,
        MatCheckboxModule,
        MatSelectModule,
        MatListModule,
        MatInputModule,

        // Detail view
        MotionSubmitterCommonServiceModule,
        PersonalNoteServiceModule,
        ScrollingModule,
        MatBadgeModule,

        // Amendment create wizard
        MatStepperModule,
        MatRadioModule
    ]
})
export class MotionDetailModule {}
