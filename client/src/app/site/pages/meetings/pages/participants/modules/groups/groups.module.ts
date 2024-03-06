import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

import { GroupListComponent } from './components/group-list/group-list.component';
import { GroupsRoutingModule } from './groups-routing.module';

@NgModule({
    declarations: [GroupListComponent],
    imports: [
        CommonModule,
        GroupsRoutingModule,
        HeadBarModule,
        OpenSlidesTranslationModule.forChild(),
        MatCardModule,
        MatTableModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatTooltipModule,
        ReactiveFormsModule,
        FormsModule
    ]
})
export class GroupsModule {}
