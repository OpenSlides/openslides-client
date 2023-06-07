import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { SortingListModule } from 'src/app/ui/modules/sorting/modules/sorting-list/sorting-list.module';

import { ParticipantCommonServiceModule } from '../../pages/participants/services/common/participant-common-service.module';
import { DetailViewModule } from '../meetings-component-collector/detail-view/detail-view.module';
import { ParticipantSearchSelectorModule } from '../participant-search-selector';
import { ListOfSpeakersContentComponent } from './components/list-of-speakers-content/list-of-speakers-content.component';
import { ListOfSpeakersContentTitleDirective } from './directives/list-of-speakers-content-title.directive';
import { PointOfOrderDialogModule } from './modules/point-of-order-dialog/point-of-order-dialog.module';

const DECLARATIONS = [ListOfSpeakersContentComponent, ListOfSpeakersContentTitleDirective];

@NgModule({
    exports: DECLARATIONS,
    declarations: DECLARATIONS,
    imports: [
        CommonModule,
        DetailViewModule,
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
        ParticipantSearchSelectorModule,
        ParticipantCommonServiceModule,
        PointOfOrderDialogModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ListOfSpeakersContentModule {}
