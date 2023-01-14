import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
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
        ReactiveFormsModule
    ]
})
export class GroupsModule {}
