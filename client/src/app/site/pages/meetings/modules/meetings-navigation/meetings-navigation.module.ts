import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { GlobalHeadbarModule } from 'src/app/site/modules/global-headbar';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { SidenavModule } from 'src/app/ui/modules/sidenav';

import { InteractionModule } from '../../pages/interaction/interaction.module';
import { MeetingsNavigationWrapperComponent } from './components/meetings-navigation-wrapper/meetings-navigation-wrapper.component';

const EXPORTS = [MeetingsNavigationWrapperComponent];

@NgModule({
    declarations: [...EXPORTS],
    exports: EXPORTS,
    imports: [
        CommonModule,
        SidenavModule,
        DirectivesModule,
        GlobalHeadbarModule,
        InteractionModule,
        OpenSlidesTranslationModule.forChild(),
        MatMenuModule,
        MatDividerModule,
        MatIconModule,
        MatBadgeModule,
        RouterModule
    ]
})
export class MeetingsNavigationModule {}
