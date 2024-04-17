import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ListModule } from 'src/app/ui/modules/list';

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
        ReactiveFormsModule,
        HeadBarModule,
        ListModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class TagsModule {}
