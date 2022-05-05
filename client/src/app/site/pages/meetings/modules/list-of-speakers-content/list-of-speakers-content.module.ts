import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListOfSpeakersContentComponent } from './components/list-of-speakers-content/list-of-speakers-content.component';
import { ListOfSpeakersContentTitleDirective } from './directives/list-of-speakers-content-title.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { SortingListModule } from 'src/app/ui/modules/sorting/modules/sorting-list/sorting-list.module';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { ParticipantCommonServiceModule } from '../../pages/participants/services/common/participant-common-service.module';
import { PointOfOrderDialogModule } from './modules/point-of-order-dialog/point-of-order-dialog.module';
import { DirectivesModule } from 'src/app/ui/directives';
import { MatButtonModule } from '@angular/material/button';

const DECLARATIONS = [ListOfSpeakersContentComponent, ListOfSpeakersContentTitleDirective];

@NgModule({
    exports: DECLARATIONS,
    declarations: DECLARATIONS,
    imports: [
        CommonModule,
        MatIconModule,
        MatExpansionModule,
        MatListModule,
        MatCardModule,
        MatTooltipModule,
        MatMenuModule,
        MatFormFieldModule,
        MatButtonModule,
        ReactiveFormsModule,
        SortingListModule,
        SearchSelectorModule,
        ParticipantCommonServiceModule,
        PointOfOrderDialogModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ListOfSpeakersContentModule {}
