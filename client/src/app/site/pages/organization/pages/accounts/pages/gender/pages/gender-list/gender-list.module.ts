import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ChipModule } from 'src/app/ui/modules/chip';
import { HeadBarModule } from 'src/app/ui/modules/head-bar/head-bar.module';
import { ListModule } from 'src/app/ui/modules/list';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';

import { GenderListComponent } from './components/gender-list/gender-list.component';
import { GenderListRoutingModule } from './gender-list-routing.module';

@NgModule({
    declarations: [GenderListComponent],
    imports: [
        CommonModule,
        GenderListRoutingModule,
        PromptDialogModule,
        HeadBarModule,
        ListModule,
        ChipModule,
        OpenSlidesTranslationModule.forChild(),
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatDividerModule,
        MatDialogModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatTooltipModule
    ]
})
export class GenderListModule {}
