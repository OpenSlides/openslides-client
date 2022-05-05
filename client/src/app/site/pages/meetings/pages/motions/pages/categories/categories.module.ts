import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { CategoryDetailComponent } from './components/category-detail/category-detail.component';
import { CategoryDetailSortComponent } from './components/category-detail-sort/category-detail-sort.component';
import { CategoryListSortComponent } from './components/category-list-sort/category-list-sort.component';
import { MotionCategoryCommonServiceModule } from '../../modules';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { DirectivesModule } from 'src/app/ui/directives';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MotionsCommonServiceModule } from '../../services/common/motions-service.module';
import { SortingModule } from 'src/app/ui/modules/sorting';

@NgModule({
    declarations: [
        CategoryListComponent,
        CategoryListSortComponent,
        CategoryDetailComponent,
        CategoryDetailSortComponent
    ],
    imports: [
        CommonModule,
        CategoriesRoutingModule,
        MotionsCommonServiceModule,
        MotionCategoryCommonServiceModule,
        MatDialogModule,
        MatFormFieldModule,
        MatMenuModule,
        MatIconModule,
        MatTooltipModule,
        MatCardModule,
        MatTableModule,
        MatChipsModule,
        MatDividerModule,
        MatInputModule,
        ReactiveFormsModule,
        SortingModule,
        MeetingsComponentCollectorModule,
        HeadBarModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class CategoriesModule {}
