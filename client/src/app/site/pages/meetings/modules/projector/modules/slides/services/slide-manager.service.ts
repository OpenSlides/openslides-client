import { createNgModuleRef, Inject, Injectable, Injector, Type } from '@angular/core';

import { BaseSlideComponent } from '../base/base-slide-component';
import { SLIDE_MANIFESTS, SlideConfiguration, SlideManifest, SlideToken } from '../definitions';
import { SlidesModule } from '../slides.module';

@Injectable({ providedIn: SlidesModule })
export class SlideManagerService {
    private loadedSlides: { [name: string]: SlideManifest } = {};

    public constructor(
        @Inject(SLIDE_MANIFESTS) private manifests: SlideManifest[],
        private injector: Injector
    ) {
        this.manifests.forEach(slideManifest => {
            this.loadedSlides[slideManifest.path] = slideManifest;
        });
    }

    /**
     * Searches the manifest for the given slide name.
     *
     * @param slideName The slide to look up.
     * @returns the slide's manifest.
     */
    private getManifest(slideName: string): SlideManifest {
        if (!this.loadedSlides[slideName]) {
            throw new Error(`Could not find slide for "${slideName}"`);
        }
        return this.loadedSlides[slideName];
    }

    /**
     * Get slide options for a given slide.
     *
     * @param slideName The slide
     * @returns SlideOptions for the requested slide.
     */
    public getSlideConfiguration(slideName: string): SlideConfiguration {
        if (!this.loadedSlides[slideName]) {
            throw new Error(`Could not find slide for "${slideName}"`);
        }
        return this.loadedSlides[slideName];
    }

    /**
     * Get slide verbose name for a given slide.
     *
     * @param slideName The slide
     * @returns the verbose slide name for the requested slide.
     */
    public getSlideVerboseName(slideName: string): string {
        return this.getManifest(slideName).verboseName;
    }

    /**
     * Asynchronously load the slide's component
     *
     * @param slideName The slide to search.
     */
    public async getSlideType<T extends BaseSlideComponent<Record<string, unknown>>>(
        slideName: string
    ): Promise<Type<T>> {
        const manifest = this.getManifest(slideName);
        const loadedModule = (await manifest.loadChildren()) as any;
        const moduleRef = createNgModuleRef(loadedModule, this.injector);

        // Get the slide provided by the `SlideToken.token`-injectiontoken.
        let dynamicComponentType: Type<T>;
        try {
            // Read from the moduleRef injector and locate the dynamic component type
            dynamicComponentType = moduleRef.injector.get(SlideToken.token);
        } catch (e) {
            console.error(
                `The module for Slide "` + slideName + `" is not configured right: Cannot file the slide token.`
            );
            throw e;
        }

        return dynamicComponentType;
    }
}
