import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { CommaSeparatedListingModule } from 'src/app/ui/modules/comma-separated-listing';
import { IconContainerComponent } from 'src/app/ui/modules/icon-container';
import { ListModule } from 'src/app/ui/modules/list';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';

import { FileListComponent } from './components/file-list/file-list.component';

const DECLARATIONS = [FileListComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatButtonModule,
        MatDialogModule,
        ListModule,
        SearchSelectorModule,
        IconContainerComponent,
        PipesModule,
        OpenSlidesTranslationModule.forChild(),
        CommaSeparatedListingModule
    ]
})
export class FileListModule {}
