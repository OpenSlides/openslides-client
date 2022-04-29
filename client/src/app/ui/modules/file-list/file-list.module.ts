import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileListComponent } from './components/file-list/file-list.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { IconContainerModule } from 'src/app/ui/modules/icon-container/icon-container.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PblNgridModule } from '@pebula/ngrid';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';
import { MatButtonModule } from '@angular/material/button';
import { PblNgridMaterialModule } from '@pebula/ngrid-material';
import { PblNgridTargetEventsModule } from '@pebula/ngrid/target-events';

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
        PblNgridModule,
        PblNgridMaterialModule,
        PblNgridTargetEventsModule,
        SearchSelectorModule,
        IconContainerModule,
        PipesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class FileListModule {}
