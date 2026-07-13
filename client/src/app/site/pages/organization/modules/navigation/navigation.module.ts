import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { GlobalHeadbarModule } from '@app/site/modules/global-headbar';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { DirectivesModule } from '@app/ui/directives';
import { SidenavModule } from '@app/ui/modules/sidenav/sidenav.module';

import { OrganizationNavigationComponent } from './organization-navigation/organization-navigation.component';
import { OrganizationNavigationWrapperComponent } from './organization-navigation-wrapper/organization-navigation-wrapper.component';

@NgModule({
    declarations: [OrganizationNavigationWrapperComponent, OrganizationNavigationComponent],
    imports: [
        CommonModule,
        RouterModule,
        GlobalHeadbarModule,
        SidenavModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        OpenSlidesTranslationModule.forChild(),
        DirectivesModule
    ]
})
export class NavigationModule {}
