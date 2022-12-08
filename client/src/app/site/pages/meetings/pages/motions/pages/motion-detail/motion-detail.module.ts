import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { ActionCardModule } from 'src/app/ui/modules/action-card';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';
import { EditorModule } from 'src/app/ui/modules/editor';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { SortingModule } from 'src/app/ui/modules/sorting';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';

import { AttachmentControlModule } from '../../../../modules/meetings-component-collector/attachment-control/attachment-control.module';
import { ParticipantSearchSelectorModule } from '../../../../modules/participant-search-selector';
import { AgendaItemCommonServiceModule } from '../../../agenda/services/agenda-item-common-service.module';
import { ParticipantCommonServiceModule } from '../../../participants/services/common/participant-common-service.module';
import { MotionForwardDialogModule } from '../../components/motion-forward-dialog/motion-forward-dialog.module';
import { MotionPollModule } from '../../modules/motion-poll';
import { MotionsExportModule } from '../../services/export/motions-export.module';
import { MotionsListServiceModule } from '../../services/list/motions-list-service.module';
import { AmendmentCreateWizardComponent } from './components/amendment-create-wizard/amendment-create-wizard.component';
import { MotionAddPollButtonComponent } from './components/motion-add-poll-button/motion-add-poll-button.component';
import { MotionCommentComponent } from './components/motion-comment/motion-comment.component';
import { MotionCommentsComponent } from './components/motion-comments/motion-comments.component';
import { MotionContentComponent } from './components/motion-content/motion-content.component';
import { MotionDetailComponent } from './components/motion-detail/motion-detail.component';
import { MotionDetailDiffComponent } from './components/motion-detail-diff/motion-detail-diff.component';
import { MotionDetailDiffSummaryComponent } from './components/motion-detail-diff-summary/motion-detail-diff-summary.component';
import { MotionDetailOriginalChangeRecommendationsComponent } from './components/motion-detail-original-change-recommendations/motion-detail-original-change-recommendations.component';
import { MotionDetailViewComponent } from './components/motion-detail-view/motion-detail-view.component';
import { MotionExtensionFieldComponent } from './components/motion-extension-field/motion-extension-field.component';
import { MotionFinalVersionComponent } from './components/motion-final-version/motion-final-version.component';
import { MotionHighlightFormComponent } from './components/motion-highlight-form/motion-highlight-form.component';
import { MotionManagePollsComponent } from './components/motion-manage-polls/motion-manage-polls.component';
import { MotionManageSubmittersComponent } from './components/motion-manage-submitters/motion-manage-submitters.component';
import { MotionManageTitleComponent } from './components/motion-manage-title/motion-manage-title.component';
import { MotionMetaDataComponent } from './components/motion-meta-data/motion-meta-data.component';
import { MotionParagraphbasedAmendmentComponent } from './components/motion-paragraphbased-amendment/motion-paragraphbased-amendment.component';
import { MotionPersonalNoteComponent } from './components/motion-personal-note/motion-personal-note.component';
import { ParagraphBasedAmendmentComponent } from './components/paragraph-based-amendment/paragraph-based-amendment.component';
import { MotionDetailDirectivesModule } from './modules/directives/motion-detail-directives.module';
import { MotionChangeRecommendationDialogModule } from './modules/motion-change-recommendation-dialog/motion-change-recommendation-dialog.module';
import { MotionDetailRoutingModule } from './motion-detail-routing.module';
import { MotionDetailServiceModule } from './services/motion-detail-service.module';

@NgModule({
    declarations: [
        MotionAddPollButtonComponent,
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
        MotionDetailDiffSummaryComponent,
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
        ParticipantSearchSelectorModule,

        // Detail view
        ScrollingModule,
        MatBadgeModule,

        // Amendment create wizard
        MatStepperModule,
        MatRadioModule
    ]
})
export class MotionDetailModule {}
