import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { PipesModule } from '../../pipes/pipes.module';
import { CopyrightSignComponent } from './components/copyright-sign/copyright-sign.component';
import { ImageComponent } from './components/image/image.component';
import { LogoComponent } from './components/logo/logo.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { SidenavDrawerContentDirective } from './directives/sidenav-drawer-content.directive';
import { SidenavMainContentDirective } from './directives/sidenav-main-content.directive';
import { EasterEggModule } from './modules/easter-egg';

const EXPORTS = [SidenavComponent, SidenavMainContentDirective, SidenavDrawerContentDirective];

@NgModule({
    declarations: [...EXPORTS, CopyrightSignComponent, LogoComponent, ImageComponent],
    exports: EXPORTS,
    imports: [
        CommonModule,
        MatSidenavModule,
        RouterModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatMenuModule,
        MatButtonModule,
        EasterEggModule,
        PipesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class SidenavModule {}
