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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { ChipSelectModule } from 'src/app/site/modules/chip-select/chip-select.module';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { ActionCardComponent } from 'src/app/ui/modules/action-card';
import { ChoiceDialogComponent } from 'src/app/ui/modules/choice-dialog';
import { CommaSeparatedListingComponent } from 'src/app/ui/modules/comma-separated-listing';
import { DatepickerModule } from 'src/app/ui/modules/datepicker';
import { EditorModule } from 'src/app/ui/modules/editor';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerComponent } from 'src/app/ui/modules/icon-container';
import { OpenSlidesDateAdapterModule } from 'src/app/ui/modules/openslides-date-adapter/openslides-date-adapter.module';
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
import { MotionDetailComponent } from './components/motion-detail/motion-detail.component';
import { MotionDetailDirectivesModule } from './modules/directives/motion-detail-directives.module';
import { MotionChangeRecommendationDialogModule } from './modules/motion-change-recommendation-dialog/motion-change-recommendation-dialog.module';
import { MotionDetailRoutingModule } from './motion-detail-routing.module';
import { MotionAddPollButtonComponent } from './pages/motion-view/components/motion-add-poll-button/motion-add-poll-button.component';
import { MotionCommentComponent } from './pages/motion-view/components/motion-comment/motion-comment.component';
import { MotionCommentsComponent } from './pages/motion-view/components/motion-comments/motion-comments.component';
import { MotionContentComponent } from './pages/motion-view/components/motion-content/motion-content.component';
import { MotionDetailDiffComponent } from './pages/motion-view/components/motion-detail-diff/motion-detail-diff.component';
import { MotionDetailDiffSummaryComponent } from './pages/motion-view/components/motion-detail-diff-summary/motion-detail-diff-summary.component';
import { MotionDetailOriginalChangeRecommendationsComponent } from './pages/motion-view/components/motion-detail-original-change-recommendations/motion-detail-original-change-recommendations.component';
import { MotionExtensionFieldComponent } from './pages/motion-view/components/motion-extension-field/motion-extension-field.component';
import { MotionFinalVersionComponent } from './pages/motion-view/components/motion-final-version/motion-final-version.component';
import { MotionHighlightFormComponent } from './pages/motion-view/components/motion-highlight-form/motion-highlight-form.component';
import { MotionManageMotionMeetingUsersComponent } from './pages/motion-view/components/motion-manage-motion-meeting-users/motion-manage-motion-meeting-users.component';
import { MotionManagePollsComponent } from './pages/motion-view/components/motion-manage-polls/motion-manage-polls.component';
import { MotionManageSupportersComponent } from './pages/motion-view/components/motion-manage-supporters/motion-manage-supporters.component';
import { MotionManageTimestampComponent } from './pages/motion-view/components/motion-manage-timestamp/motion-manage-timestamp.component';
import { MotionManageTitleComponent } from './pages/motion-view/components/motion-manage-title/motion-manage-title.component';
import { MotionMetaDataComponent } from './pages/motion-view/components/motion-meta-data/motion-meta-data.component';
import { MotionPersonalNoteComponent } from './pages/motion-view/components/motion-personal-note/motion-personal-note.component';
import { MotionViewComponent } from './pages/motion-view/components/motion-view/motion-view.component';
import { OriginMotionMetaDataComponent } from './pages/motion-view/components/origin-motion-meta-data/origin-motion-meta-data.component';
import { ParagraphBasedAmendmentComponent } from './pages/motion-view/components/paragraph-based-amendment/paragraph-based-amendment.component';
import { MotionDetailServiceModule } from './services/motion-detail-service.module';

@NgModule({
    declarations: [
        MotionAddPollButtonComponent,
        MotionDetailComponent,
        MotionViewComponent,
        MotionContentComponent,
        MotionMetaDataComponent,
        MotionManageTitleComponent,
        MotionManagePollsComponent,
        MotionHighlightFormComponent,
        MotionExtensionFieldComponent,
        MotionManageMotionMeetingUsersComponent,
        MotionDetailDiffComponent,
        MotionDetailDiffSummaryComponent,
        MotionDetailOriginalChangeRecommendationsComponent,
        MotionCommentsComponent,
        MotionPersonalNoteComponent,
        MotionCommentComponent,
        MotionFinalVersionComponent,
        ParagraphBasedAmendmentComponent,
        MotionManageTimestampComponent,
        OriginMotionMetaDataComponent
    ],
    imports: [
        CommonModule,
        CommaSeparatedListingComponent,
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
        ChoiceDialogComponent,
        DirectivesModule,
        PipesModule,
        IconContainerComponent,
        SortingModule,
        SearchSelectorModule,
        EditorModule,
        ActionCardComponent,
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
        MatTabsModule,
        MatTooltipModule,
        MatChipsModule,
        MatCheckboxModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatListModule,
        MatInputModule,
        MatProgressBarModule,
        ParticipantSearchSelectorModule,
        OpenSlidesDateAdapterModule,
        NgxMaterialTimepickerModule,
        DatepickerModule,
        // Detail view
        ScrollingModule,
        ChipSelectModule,
        MatBadgeModule,
        MatProgressSpinnerModule,
        MotionManageSupportersComponent
    ]
})
export class MotionDetailModule {}
