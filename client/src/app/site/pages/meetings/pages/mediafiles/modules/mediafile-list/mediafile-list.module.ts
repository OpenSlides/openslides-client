import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MediafileListRoutingModule } from './mediafile-list-routing.module';
import { MediafileListComponent } from './components/mediafile-list/mediafile-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MediafileListServiceModule } from './services/mediafile-list-service.module';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { PblNgridModule } from '@pebula/ngrid';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { IconContainerModule } from 'src/app/ui/modules/icon-container/icon-container.module';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatDividerModule } from '@angular/material/divider';
import { DirectivesModule } from 'src/app/ui/directives';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { FileListModule } from 'src/app/ui/modules/file-list/file-list.module';
import { MatInputModule } from '@angular/material/input';
import { MediafileCommonServiceModule } from '../../services/mediafile-common-service.module';

@NgModule({
    declarations: [MediafileListComponent],
    imports: [
        CommonModule,
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
        PblNgridModule,
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
