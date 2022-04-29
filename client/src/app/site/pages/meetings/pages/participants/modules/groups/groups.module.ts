import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GroupsRoutingModule } from './groups-routing.module';
import { GroupListComponent } from './components/group-list/group-list.component';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';

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
