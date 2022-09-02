import { Component, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { OpenSlidesStatusService } from 'src/app/site/services/openslides-status.service';
import { ElementSize } from 'src/app/ui/directives/resized/resized.directive';
import { Container } from 'tsparticles';

import { ApplauseService } from '../../../../services/applause.service';
import { particleConfig, particleOptions } from './particle-options';

@Component({
    selector: `os-applause-particle-display`,
    templateUrl: `./applause-particle-display.component.html`,
    styleUrls: [`./applause-particle-display.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class ApplauseParticleDisplayComponent extends BaseMeetingComponent {
    public options = particleOptions;
    public isStable: Promise<boolean> = this.osStatus.stable.then(() => true);
    private particleContainer!: Container;

    public set particleImage(imageUrl: string | undefined) {
        this.setParticleImage(imageUrl);
    }

    public set particleLevel(level: number) {
        this.setParticleLevel(level);
    }

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private applauseService: ApplauseService,
        private osStatus: OpenSlidesStatusService
    ) {
        super(componentServiceCollector, translate);
        this.subscriptions.push(
            applauseService.applauseLevelObservable.subscribe(applauseLevel => {
                this.particleLevel = this.calcEmitterLevel(applauseLevel || 0);
            }),
            this.meetingSettingsService.get(`applause_particle_image_url`).subscribe(particleImage => {
                this.particleImage = particleImage || undefined;
            })
        );
    }

    public updateParticleContainer(size: ElementSize): void {
        if (!size.height || !size.width) {
            this.stop();
        } else {
            this.refresh();
        }
    }

    private setParticleImage(particleImage: string | undefined): void {
        if (particleImage) {
            particleConfig.customImageShape.image.src = particleImage;
            (this.options.particles.shape as any) = particleConfig.customImageShape;
        } else {
            (this.options.particles.shape as any) = particleConfig.charShapeHearth;
        }
        if (this.particleContainer) {
            this.particleContainer.options.particles.load(this.options.particles as any);
            this.refresh();
        }
    }

    private calcEmitterLevel(applauseLevel: number): number {
        if (!applauseLevel) {
            return 0;
        }
        let emitterLevel = this.applauseService.getApplauseQuote(applauseLevel);
        emitterLevel = Math.ceil(emitterLevel * 10);
        return emitterLevel;
    }

    private setParticleLevel(level: number): void {
        if (this.particleContainer) {
            const emitters = this.particleContainer.plugins.get(`emitters`) as any;
            if (emitters) {
                emitters.array[0].options.rate.quantity = level;
            }
        }
    }

    private stop(): void {
        this.particleContainer?.stop();
    }

    private refresh(): void {
        this.particleContainer?.refresh();
    }

    public particlesLoaded(container: Container): void {
        this.particleContainer = container;
        this.refresh();
    }
}
