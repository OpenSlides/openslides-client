import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { MeetingsComponentCollectorModule } from '@app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from '@app/ui/directives';
import { CommaSeparatedListingComponent } from '@app/ui/modules/comma-separated-listing';
import { FileListComponent } from '@app/ui/modules/file-list/file-list.component';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { IconContainerComponent } from '@app/ui/modules/icon-container';
import { SearchSelectorModule } from '@app/ui/modules/search-selector';
import { PipesModule } from '@app/ui/pipes/pipes.module';

import { MediafileCommonServiceModule } from '../../services/mediafile-common-service.module';
import { MediafileListComponent } from './components/mediafile-list/mediafile-list.component';
import { MediafileListRoutingModule } from './mediafile-list-routing.module';
import { MediafileListServiceModule } from './services/mediafile-list-service.module';

@NgModule({
    declarations: [MediafileListComponent],
    imports: [
        CommonModule,
        CommaSeparatedListingComponent,
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
        FileListComponent,

        MeetingsComponentCollectorModule,
        HeadBarModule,
        SearchSelectorModule,
        IconContainerComponent,
        DirectivesModule,
        PipesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MediafileListModule {}
