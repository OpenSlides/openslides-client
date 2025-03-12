import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChoiceDialogComponent } from 'src/app/ui/modules/choice-dialog';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerComponent } from 'src/app/ui/modules/icon-container';
import { ListModule } from 'src/app/ui/modules/list';
import { PipesModule } from 'src/app/ui/pipes';

import { StructureLevelListComponent } from './components/structure-level-list/structure-level-list.component';
import { StructureLevelRoutingModule } from './structure-level-routing.module';

@NgModule({
    declarations: [StructureLevelListComponent],
    imports: [
        StructureLevelRoutingModule,
        CommonModule,
        HeadBarModule,
        ListModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        MatButtonModule,
        MatCheckboxModule,
        ReactiveFormsModule,
        OpenSlidesTranslationModule.forChild(),
        RouterModule,
        DirectivesModule,
        ChoiceDialogComponent,
        IconContainerComponent,
        PipesModule
    ]
})
export class StructureLevelModule {}
