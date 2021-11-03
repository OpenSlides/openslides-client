import { Component, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { OpenSlidesStatusService } from 'app/core/core-services/openslides-status.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { ElementSize } from 'app/shared/directives/resized.directive';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ApplauseService } from 'app/site/interaction/services/applause.service';
import { Subject } from 'rxjs';
import { auditTime } from 'rxjs/operators';
import { Container } from 'tsparticles';

import { particleConfig, particleOptions } from './particle-options';

@Component({
    selector: `os-applause-particle-display`,
    templateUrl: `./applause-particle-display.component.html`,
    styleUrls: [`./applause-particle-display.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class ApplauseParticleDisplayComponent extends BaseComponent {
    public options = particleOptions;
    public resizeSubject = new Subject<ElementSize>();
    public isStable: Promise<boolean> = this.osStatus.stable.then(() => true);
    private resizeAuditTime = 200;
    private particleContainer: Container;

    public set particleImage(imageUrl: string) {
        this.setParticleImage(imageUrl);
    }

    public set particleLevel(level: number) {
        this.setParticleLevel(level);
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        settingService: MeetingSettingsService,
        private applauseService: ApplauseService,
        private osStatus: OpenSlidesStatusService
    ) {
        super(componentServiceCollector, translate);
        this.subscriptions.push(
            this.resizeSubject.pipe(auditTime(this.resizeAuditTime)).subscribe(size => {
                this.updateParticleContainer(size);
            }),
            applauseService.applauseLevelObservable.subscribe(applauseLevel => {
                this.particleLevel = this.calcEmitterLevel(applauseLevel || 0);
            }),
            settingService.get(`applause_particle_image_url`).subscribe(particleImage => {
                this.particleImage = particleImage || undefined;
            })
        );
    }

    private setParticleImage(particleImage: string): void {
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
                emitters.array[0].emitterOptions.rate.quantity = level;
            }
        }
    }

    private updateParticleContainer(size: ElementSize): void {
        if (!size.height || !size.width) {
            this.stop();
        } else {
            this.refresh();
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
