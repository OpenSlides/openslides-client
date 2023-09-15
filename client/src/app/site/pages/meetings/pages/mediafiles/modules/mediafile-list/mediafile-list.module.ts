import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { CommaSeparatedListingModule } from 'src/app/ui/modules/comma-separated-listing';
import { FileListModule } from 'src/app/ui/modules/file-list/file-list.module';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerModule } from 'src/app/ui/modules/icon-container/icon-container.module';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';

import { MediafileCommonServiceModule } from '../../services/mediafile-common-service.module';
import { MediafileListComponent } from './components/mediafile-list/mediafile-list.component';
import { MediafileListRoutingModule } from './mediafile-list-routing.module';
import { MediafileListServiceModule } from './services/mediafile-list-service.module';

@NgModule({
    declarations: [MediafileListComponent],
    imports: [
        CommonModule,
        CommaSeparatedListingModule,
        MediafileListRoutingModule,
        MediafileListServiceModule,
        MediafileCommonServiceModule,
        ReactiveFormsModule,
        RouterModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatDialogModule,
        MatDividerModule,
        MatInputModule,
        FileListModule,

        MeetingsComponentCollectorModule,
        HeadBarModule,
        SearchSelectorModule,
        IconContainerModule,
        DirectivesModule,
        PipesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MediafileListModule {}
