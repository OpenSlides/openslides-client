import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { ListModule } from '@app/ui/modules/list';

import { TagListComponent } from './components/tag-list/tag-list.component';
import { TagsRoutingModule } from './tags-routing.module';

@NgModule({
    declarations: [TagListComponent],
    imports: [
        CommonModule,
        TagsRoutingModule,
        MatIconModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatDialogModule,
        MatTooltipModule,
        ReactiveFormsModule,
        HeadBarModule,
        ListModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class TagsModule {}
