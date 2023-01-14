import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
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
