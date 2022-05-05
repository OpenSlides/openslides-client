import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectorListRoutingModule } from './projector-list-routing.module';
import { ProjectorListComponent } from './components/projector-list/projector-list.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ProjectorListEntryComponent } from './components/projector-list-entry/projector-list-entry.component';
import { ProjectorModule } from '../../../../modules/projector/projector.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { ActionCardModule } from 'src/app/ui/modules/action-card/action-card.module';
import { DirectivesModule } from 'src/app/ui/directives';
import { ProjectorEditDialogModule } from '../../components/projector-edit-dialog/projector-edit-dialog.module';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';
import { MatInputModule } from '@angular/material/input';

@NgModule({
    declarations: [ProjectorListComponent, ProjectorListEntryComponent],
    imports: [
        CommonModule,
        ProjectorListRoutingModule,
        MatDialogModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
        HeadBarModule,
        PromptDialogModule,
        ProjectorModule,
        ActionCardModule,
        DirectivesModule,
        ProjectorEditDialogModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ProjectorListModule {}
