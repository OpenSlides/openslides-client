import { NgModule } from '@angular/core';
import { EasterEggContentPlatformDialogComponent } from './components/easter-egg-content-platform-dialog/easter-egg-content-platform-dialog.component';
import { GridModule } from 'src/app/ui/modules/grid';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { DirectivesModule } from 'src/app/ui/directives';
import { PortalModule } from '@angular/cdk/portal';

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
