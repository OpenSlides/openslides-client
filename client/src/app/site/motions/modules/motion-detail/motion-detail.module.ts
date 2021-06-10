import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AmendmentCreateWizardComponent } from './components/amendment-create-wizard/amendment-create-wizard.component';
import { SharedModule } from 'app/shared/shared.module';
import { ManageSubmittersComponent } from './components/manage-submitters/manage-submitters.component';
import { MotionChangeRecommendationDialogComponent } from './components/motion-change-recommendation-dialog/motion-change-recommendation-dialog.component';
import { MotionCommentComponent } from './components/motion-comment/motion-comment.component';
import { MotionCommentsComponent } from './components/motion-comments/motion-comments.component';
import { MotionContentComponent } from './components/motion-content/motion-content.component';
import { MotionDetailDiffComponent } from './components/motion-detail-diff/motion-detail-diff.component';
import { MotionDetailOriginalChangeRecommendationsComponent } from './components/motion-detail-original-change-recommendations/motion-detail-original-change-recommendations.component';
import { MotionDetailRoutingModule } from './motion-detail-routing.module';
import { MotionDetailComponent } from './components/motion-detail/motion-detail.component';
import { MotionFinalVersionComponent } from './components/motion-final-version/motion-final-version.component';
import { MotionForwardDialogComponent } from './components/motion-forward-dialog/motion-forward-dialog.component';
import { MotionHighlightFormComponent } from './components/motion-highlight-form/motion-highlight-form.component';
import { MotionManagePollsComponent } from './components/motion-manage-polls/motion-manage-polls.component';
import { MotionManageTitleComponent } from './components/motion-manage-title/motion-manage-title.component';
import { MotionMetaDataComponent } from './components/motion-meta-data/motion-meta-data.component';
import { MotionPollModule } from '../motion-poll/motion-poll.module';
import { MotionTitleChangeRecommendationDialogComponent } from './components/motion-title-change-recommendation-dialog/motion-title-change-recommendation-dialog.component';
import { ParagraphBasedAmendmentComponent } from './components/paragraph-based-amendment/paragraph-based-amendment.component';
import { PersonalNoteComponent } from './components/personal-note/personal-note.component';

@NgModule({
    imports: [CommonModule, MotionDetailRoutingModule, SharedModule, MotionPollModule],
    declarations: [
        MotionDetailComponent,
        AmendmentCreateWizardComponent,
        MotionCommentsComponent,
        PersonalNoteComponent,
        ManageSubmittersComponent,
        MotionDetailDiffComponent,
        MotionDetailOriginalChangeRecommendationsComponent,
        MotionChangeRecommendationDialogComponent,
        MotionTitleChangeRecommendationDialogComponent,
        MotionCommentComponent,
        MotionMetaDataComponent,
        MotionContentComponent,
        MotionHighlightFormComponent,
        ParagraphBasedAmendmentComponent,
        MotionManageTitleComponent,
        MotionManagePollsComponent,
        MotionFinalVersionComponent,
        MotionForwardDialogComponent
    ]
})
export class MotionDetailModule {}
