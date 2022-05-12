import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommentsRoutingModule } from './comments-routing.module';
import { CommentSectionListComponent } from './components/comment-section-list/comment-section-list.component';
import { CommentSectionSortComponent } from './components/comment-section-sort/comment-section-sort.component';
import { SortingModule } from 'src/app/ui/modules/sorting';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MatCardModule } from '@angular/material/card';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@NgModule({
    declarations: [CommentSectionListComponent, CommentSectionSortComponent],
    imports: [
        CommonModule,
        CommentsRoutingModule,
        SortingModule,
        HeadBarModule,
        SearchSelectorModule,
        IconContainerModule,
        OpenSlidesTranslationModule.forChild(),
        MatCardModule,
        MatExpansionModule,
        MatIconModule,
        MatMenuModule,
        MatFormFieldModule,
        MatDialogModule,
        MatInputModule,
        ReactiveFormsModule
    ]
})
export class CommentsModule {}
