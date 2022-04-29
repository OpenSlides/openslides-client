import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteractionContainerComponent } from './components/interaction-container/interaction-container.component';
import { ApplauseBarDisplayComponent } from './components/applause-bar-display/applause-bar-display.component';
import { StreamComponent } from './components/stream/stream.component';
import { CallComponent } from './components/call/call.component';
import { ApplauseParticleDisplayComponent } from './components/applause-particle-display/applause-particle-display.component';
import { CallDialogComponent } from './components/call-dialog/call-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { PipesModule } from 'src/app/ui/pipes';
import { NgParticlesModule } from 'ng-particles';
import { DirectivesModule } from 'src/app/ui/directives';
import { MatCardModule } from '@angular/material/card';
import { ProgressComponent } from './components/progress/progress.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';

const EXPORTS = [InteractionContainerComponent];

@NgModule({
    exports: EXPORTS,
    declarations: [
        ...EXPORTS,
        ApplauseBarDisplayComponent,
        StreamComponent,
        CallComponent,
        ApplauseParticleDisplayComponent,
        CallDialogComponent,
        ProgressComponent,
        VideoPlayerComponent
    ],
    imports: [
        CommonModule,
        MatProgressSpinnerModule,
        MatDividerModule,
        MatTooltipModule,
        MatIconModule,
        MatCardModule,
        NgParticlesModule,
        DirectivesModule,
        PipesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class InteractionContainerModule {}
