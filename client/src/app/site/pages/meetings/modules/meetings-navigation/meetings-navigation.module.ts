import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
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
        MatListModule,
        MatIconModule,
        MatBadgeModule,
        RouterModule
    ]
})
export class MeetingsNavigationModule {}
