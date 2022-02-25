import { CommonModule, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { RouterModule } from '@angular/router';
// ngx-translate
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// PblNgrid. Cleanup Required.
import { PblNgridModule } from '@pebula/ngrid';
import { PblNgridTargetEventsModule } from '@pebula/ngrid/target-events';
import { PblNgridMaterialModule } from '@pebula/ngrid-material';
// TinyMCE
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { OverlayComponent } from 'app/shared/components/overlay/overlay.component';
import { MotionPollDialogComponent } from 'app/site/motions/modules/motion-poll/motion-poll-dialog/motion-poll-dialog.component';
import { PollFormComponent } from 'app/site/polls/components/poll-form/poll-form.component';
import { ChartsModule } from 'ng2-charts';
import { PdfViewerModule } from 'ng2-pdf-viewer';
// ngx-file-drop
import { NgxFileDropModule } from 'ngx-file-drop';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
// time picker because angular still doesnt offer one!!
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

import { OpenSlidesTranslateModule } from '../core/translate/openslides-translate-module';
import { AccountButtonComponent } from './components/account-button/account-button.component';
import { AgendaContentObjectFormComponent } from './components/agenda-content-object-form/agenda-content-object-form.component';
import { AssignmentPollDetailContentComponent } from './components/assignment-poll-detail-content/assignment-poll-detail-content.component';
import { AttachmentControlComponent } from './components/attachment-control/attachment-control.component';
import { BannerComponent } from './components/banner/banner.component';
import { BasicListViewTableComponent } from './components/basic-list-view-table/basic-list-view-table.component';
import { BlockTileComponent } from './components/block-tile/block-tile.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ChartsComponent } from './components/charts/charts.component';
import { CheckInputComponent } from './components/check-input/check-input.component';
import { ChipComponent } from './components/chip/chip.component';
import { ChipListComponent } from './components/chip-list/chip-list.component';
import { ChoiceDialogComponent } from './components/choice-dialog/choice-dialog.component';
import { ColorFormFieldComponent } from './components/color-form-field/color-form-field.component';
import { CountdownTimeComponent } from './components/contdown-time/countdown-time.component';
import { C4DialogComponent, CopyrightSignComponent } from './components/copyright-sign/copyright-sign.component';
import { CustomTranslationComponent } from './components/custom-translation/custom-translation.component';
import { DetailNavigatorComponent } from './components/detail-navigator/detail-navigator.component';
import { DetailViewComponent } from './components/detail-view/detail-view.component';
import { EeComponent } from './components/ee/ee.component';
import { ExtensionFieldComponent } from './components/extension-field/extension-field.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { GlobalHeadbarComponent } from './components/global-headbar/global-headbar.component';
import { GridLayoutComponent } from './components/grid-layout/grid-layout.component';
// components
import { HeadBarComponent } from './components/head-bar/head-bar.component';
import { IconContainerComponent } from './components/icon-container/icon-container.component';
import { ImageComponent } from './components/image/image.component';
import { ImportListViewComponent } from './components/import-list-view/import-list-view.component';
import { ImportListViewFirstTabDirective } from './components/import-list-view/import-list-view-first-tab.directive';
import { ImportListViewLastTabDirective } from './components/import-list-view/import-list-view-last-tab.directive';
import { ImportListViewStatusTemplateDirective } from './components/import-list-view/import-list-view-status-template.directive';
import { LegalNoticeContentComponent } from './components/legal-notice-content/legal-notice-content.component';
import { ListOfSpeakersContentComponent } from './components/list-of-speakers-content/list-of-speakers-content.component';
import { ListOfSpeakersContentTitleDirective } from './components/list-of-speakers-content/list-of-speakers-content-title.directive';
import { ListViewTableComponent } from './components/list-view-table/list-view-table.component';
import { LogoComponent } from './components/logo/logo.component';
import { MediaUploadContentComponent } from './components/media-upload-content/media-upload-content.component';
import { MeetingTimeComponent } from './components/meeting-time/meeting-time.component';
import { MetaTextBlockComponent } from './components/meta-text-block/meta-text-block.component';
import { MotionPollDetailContentComponent } from './components/motion-poll-detail-content/motion-poll-detail-content.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PointOfOrderDialogComponent } from './components/point-of-order-dialog/point-of-order-dialog.component';
import { PreviewComponent } from './components/preview/preview.component';
import { PrivacyPolicyContentComponent } from './components/privacy-policy-content/privacy-policy-content.component';
import { ProgressComponent } from './components/progress/progress.component';
import { ProgressSnackBarComponent } from './components/progress-snack-bar/progress-snack-bar.component';
import { ProjectionDialogComponent } from './components/projection-dialog/projection-dialog.component';
import { ProjectorComponent } from './components/projector/projector.component';
import { ProjectorButtonComponent } from './components/projector-button/projector-button.component';
import { ProjectorClockComponent } from './components/projector-clock/projector-clock.component';
import { PromptDialogComponent } from './components/prompt-dialog/prompt-dialog.component';
import { RoundedInputComponent } from './components/rounded-input/rounded-input.component';
import { SearchRepoSelectorComponent } from './components/search-selector/search-repo-selector/search-repo-selector.component';
import { SearchValueSelectorComponent } from './components/search-selector/search-value-selector/search-value-selector.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { SidenavContentDirective } from './components/sidenav/sidenav-content.directive';
import { SidenavDrawerContentDirective } from './components/sidenav/sidenav-drawer-content.directive';
import { SlideContainerComponent } from './components/slide-container/slide-container.component';
import { FilterMenuComponent } from './components/sort-filter-bar/filter-menu/filter-menu.component';
import { SortBottomSheetComponent } from './components/sort-filter-bar/sort-bottom-sheet/sort-bottom-sheet.component';
import { SortFilterBarComponent } from './components/sort-filter-bar/sort-filter-bar.component';
import { SortingListComponent } from './components/sorting-list/sorting-list.component';
import { SortingTreeComponent } from './components/sorting-tree/sorting-tree.component';
import { SpeakerButtonComponent } from './components/speaker-button/speaker-button.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { SuperSearchComponent } from './components/super-search/super-search.component';
import { TileComponent } from './components/tile/tile.component';
import { UserChangePasswordComponent } from './components/user-change-password/user-change-password.component';
import { UserDetailViewComponent } from './components/user-detail-view/user-detail-view.component';
import { UserMultiselectActionsComponent } from './components/user-multiselect-actions/user-multiselect-actions.component';
import { VerticalTabGroupComponent } from './components/vertical-tab-group/vertical-tab-group.component';
import { VerticalTabGroupLabelHeaderDirective } from './components/vertical-tab-group/vertical-tab-group-label-header.directive';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { VotingPrivacyWarningComponent } from './components/voting-privacy-warning/voting-privacy-warning.component';
import { OpenSlidesDateAdapter } from './date-adapter';
import { AutofocusDirective } from './directives/autofocus.directive';
import { CmlPermsDirective } from './directives/cml-perms.directive';
import { DomChangeDirective } from './directives/dom-change.directive';
import { HeightResizingDirective } from './directives/height-resizing.directive';
import { ListenEditingDirective } from './directives/listen-editing.directive';
import { NotFoundDescriptionDirective } from './directives/not-found-description.directive';
import { OmlPermsDirective } from './directives/oml-perms.directive';
import { OnlyNumberDirective } from './directives/only-number.directive';
// directives
import { PermsDirective } from './directives/perms.directive';
import { ResizedDirective } from './directives/resized.directive';
import { SwipeDirective } from './directives/swipe.directive';
import { MaterialDesignModule } from './libraries/material-design.module';
import { ReadableBytesPipe } from './pipes/hfilesize.pipe';
import { LocalizedDatePipe } from './pipes/localized-date.pipe';
import { ParsePollNumberPipe } from './pipes/parse-poll-number.pipe';
import { PollKeyVerbosePipe } from './pipes/poll-key-verbose.pipe';
import { PollPercentBasePipe } from './pipes/poll-percent-base.pipe';
import { PrecisionPipe } from './pipes/precision.pipe';
import { ReversePipe } from './pipes/reverse.pipe';
import { TrustPipe } from './pipes/trust.pipe';

const declarations = [
    ReadableBytesPipe,
    PermsDirective,
    DomChangeDirective,
    AutofocusDirective,
    HeadBarComponent,
    LegalNoticeContentComponent,
    PrivacyPolicyContentComponent,
    SearchValueSelectorComponent,
    PromptDialogComponent,
    SortingListComponent,
    SortingTreeComponent,
    ChoiceDialogComponent,
    SortFilterBarComponent,
    SortBottomSheetComponent,
    FilterMenuComponent,
    LogoComponent,
    CopyrightSignComponent,
    C4DialogComponent,
    ProjectorButtonComponent,
    ProjectionDialogComponent,
    ResizedDirective,
    MetaTextBlockComponent,
    ProjectorComponent,
    ProjectorClockComponent,
    SlideContainerComponent,
    CountdownTimeComponent,
    MediaUploadContentComponent,
    PrecisionPipe,
    SpeakerButtonComponent,
    GridLayoutComponent,
    TileComponent,
    BlockTileComponent,
    IconContainerComponent,
    ListViewTableComponent,
    AgendaContentObjectFormComponent,
    ExtensionFieldComponent,
    AttachmentControlComponent,
    RoundedInputComponent,
    ProgressSnackBarComponent,
    SpinnerComponent,
    SuperSearchComponent,
    OverlayComponent,
    PreviewComponent,
    HeightResizingDirective,
    TrustPipe,
    LocalizedDatePipe,
    ChartsComponent,
    CheckInputComponent,
    BannerComponent,
    PollFormComponent,
    MotionPollDialogComponent,
    ParsePollNumberPipe,
    ReversePipe,
    PollKeyVerbosePipe,
    PollPercentBasePipe,
    VotingPrivacyWarningComponent,
    MotionPollDetailContentComponent,
    AssignmentPollDetailContentComponent,
    ListOfSpeakersContentComponent,
    ImageComponent,
    OnlyNumberDirective,
    SearchRepoSelectorComponent,
    SwipeDirective,
    ListenEditingDirective,
    ChangePasswordComponent,
    UserDetailViewComponent,
    ChipComponent,
    ChipListComponent,
    CmlPermsDirective,
    OmlPermsDirective,
    BasicListViewTableComponent,
    PointOfOrderDialogComponent,
    CustomTranslationComponent,
    EeComponent,
    UserMultiselectActionsComponent,
    UserChangePasswordComponent,
    FileUploadComponent,
    ImportListViewComponent,
    ImportListViewFirstTabDirective,
    ImportListViewLastTabDirective,
    ImportListViewStatusTemplateDirective,
    VideoPlayerComponent,
    ProgressComponent,
    GlobalHeadbarComponent,
    SidenavComponent,
    SidenavContentDirective,
    SidenavDrawerContentDirective,
    AccountButtonComponent,
    NotFoundDescriptionDirective,
    MeetingTimeComponent,
    ColorFormFieldComponent,
    ListOfSpeakersContentTitleDirective,
    NotFoundComponent,
    VerticalTabGroupComponent,
    VerticalTabGroupLabelHeaderDirective,
    DetailNavigatorComponent,
    DetailViewComponent
];

const sharedModules = [
    EditorModule,
    PblNgridModule,
    PblNgridMaterialModule,
    PblNgridTargetEventsModule,
    NgxMaterialTimepickerModule,
    ChartsModule,
    NgxFileDropModule,
    NgxMatSelectSearchModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialDesignModule
];

/**
 * Share Module for all "dumb" components and pipes.
 *
 * These components don not import and inject services from core or other features
 * in their constructors.
 *
 * Should receive all data though attributes in the template of the component using them.
 * No dependency to the rest of our application.
 */
@NgModule({
    imports: [CommonModule, OpenSlidesTranslateModule.forChild(), RouterModule, ...sharedModules],
    exports: [TranslateModule, OpenSlidesTranslateModule, PdfViewerModule, ...sharedModules, ...declarations],
    declarations: [...declarations],
    providers: [
        {
            provide: DateAdapter,
            useClass: OpenSlidesDateAdapter,
            deps: [TranslateService, MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
        }, // see remarks in OpenSlidesDateAdapter
        {
            provide: TINYMCE_SCRIPT_SRC,
            useValue: `tinymce/tinymce.min.js`
        },
        SearchValueSelectorComponent,
        SortingListComponent,
        SortingTreeComponent,
        SortFilterBarComponent,
        SortBottomSheetComponent,
        DecimalPipe,
        ProgressSnackBarComponent,
        TrustPipe,
        LocalizedDatePipe,
        ParsePollNumberPipe,
        ReversePipe,
        PollKeyVerbosePipe,
        PollPercentBasePipe
    ]
})
export class SharedModule {}
