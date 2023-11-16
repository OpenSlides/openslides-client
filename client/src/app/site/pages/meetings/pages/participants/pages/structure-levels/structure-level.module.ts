import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DetailViewModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector/detail-view/detail-view.module';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { ListModule } from 'src/app/ui/modules/list';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';
import { PipesModule } from 'src/app/ui/pipes';

import { StructureLevelDetailComponent } from './components/structure-level-detail/structure-level-detail.component';
import { StructureLevelListComponent } from './components/structure-level-list/structure-level-list.component';
import { StructureLevelRoutingModule } from './structure-level-routing.module';

@NgModule({
    declarations: [StructureLevelListComponent, StructureLevelDetailComponent],
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
        MatCardModule,
        MatTableModule,
        ReactiveFormsModule,
        OpenSlidesTranslationModule.forChild(),
        RouterModule,
        DirectivesModule,
        ChoiceDialogModule,
        IconContainerModule,
        PromptDialogModule,
        PipesModule,
        DetailViewModule
    ]
})
export class StructureLevelModule {}
