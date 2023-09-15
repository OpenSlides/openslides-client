import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { NgParticlesModule } from 'ng-particles';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { PipesModule } from 'src/app/ui/pipes';

import { ApplauseBarDisplayComponent } from './components/applause-bar-display/applause-bar-display.component';
import { ApplauseParticleDisplayComponent } from './components/applause-particle-display/applause-particle-display.component';
import { CallComponent } from './components/call/call.component';
import { CallDialogComponent } from './components/call-dialog/call-dialog.component';
import { InteractionContainerComponent } from './components/interaction-container/interaction-container.component';
import { ProgressComponent } from './components/progress/progress.component';
import { StreamComponent } from './components/stream/stream.component';
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
        MatButtonModule,
        MatCardModule,
        NgParticlesModule,
        DirectivesModule,
        PipesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class InteractionContainerModule {}
