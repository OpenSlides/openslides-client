import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TagsRoutingModule } from './tags-routing.module';
import { TagListComponent } from './components/tag-list/tag-list.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ListModule } from 'src/app/ui/modules/list';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { TagCommonServiceModule } from '../../modules';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@NgModule({
    declarations: [TagListComponent],
    imports: [
        CommonModule,
        TagsRoutingModule,
        TagCommonServiceModule,
        MatIconModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatDialogModule,
        ReactiveFormsModule,
        HeadBarModule,
        ListModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class TagsModule {}
