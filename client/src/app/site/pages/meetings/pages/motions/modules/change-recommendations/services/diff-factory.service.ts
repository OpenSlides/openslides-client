import { ClassProvider, inject, Injectable, InjectionToken, Injector, StaticProvider, Type } from '@angular/core';

export const DIFF_VERSION = new InjectionToken<string>('DIFF_VERSION');

interface DiffServiceCacheEntry<T> {
    diffVersion: string;
    instance: T;
}

@Injectable({
    providedIn: 'root'
})
export class DiffServiceFactory {
    private injector = inject(Injector);

    private cache = new Map<string, DiffServiceCacheEntry<any>>();

    public createService<T>(service: Type<T> | InjectionToken<T>, diffVersion: string): T {
        const cacheKey = `${service.toString()}_${diffVersion}`;
        const cachedEntry = this.cache.get(cacheKey);

        if (cachedEntry) {
            return cachedEntry.instance;
        }

        const providers: StaticProvider[] = [
            { provide: DIFF_VERSION, useValue: diffVersion },
            { provide: service, useClass: service as Type<T> } as ClassProvider
        ];

        const customInjector = Injector.create({
            providers,
            parent: this.injector
        });

        const instance = customInjector.get(service);
        this.cache.set(cacheKey, { diffVersion, instance });

        return instance;
    }
}
