import { Injector, ProviderToken } from '@angular/core';

import { Deferred } from '../promises';

interface InjectOptions {
    defaultValue?: any;
}

export class OpenSlidesInjector {
    public static get initialized(): Promise<void> {
        return this._initialized;
    }

    private static _injector: Injector | null = null;
    private static _initialized = new Deferred();

    public static setInjector(injector: Injector): void {
        this._injector = injector;
        this._initialized.resolve();
    }

    public static get<T>(token: ProviderToken<T>, { defaultValue }: InjectOptions = {}): T {
        return this._injector.get(token, defaultValue);
    }
}
