import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { DirectivesModule } from '@app/ui/directives';
import { GridModule } from '@app/ui/modules/grid';

import { EasterEggContentPlatformDialogComponent } from './components/easter-egg-content-platform-dialog/easter-egg-content-platform-dialog.component';

@NgModule({
    declarations: [EasterEggContentPlatformDialogComponent],
    imports: [
        CommonModule,
        PortalModule,
        MatDialogModule,
        GridModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class EasterEggModule {
    public static getContentPlatform(): typeof EasterEggContentPlatformDialogComponent {
        return EasterEggContentPlatformDialogComponent;
    }
}
