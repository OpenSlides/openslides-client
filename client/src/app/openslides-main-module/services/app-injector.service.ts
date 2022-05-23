import { AbstractType, InjectionToken, Injector, Type } from '@angular/core';

export abstract class AppInjector {
    private static injector: Injector;

    public static setInjector(injector: Injector) {
        AppInjector.injector = injector;
    }

    public static get<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>): T {
        return this.injector.get<T>(token);
    }
}
