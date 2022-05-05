import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationNavigationWrapperComponent } from './organization-navigation-wrapper/organization-navigation-wrapper.component';
import { OrganizationNavigationComponent } from './organization-navigation/organization-navigation.component';
import { RouterModule } from '@angular/router';
import { SidenavModule } from 'src/app/ui/modules/sidenav/sidenav.module';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { MatMenuModule } from '@angular/material/menu';
import { GlobalHeadbarModule } from 'src/app/ui/modules/global-headbar/global-headbar.module';

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
