import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';

/**
 * Define custom error classes here
 */
export class PreventedInDemoError extends Error {
    public constructor(message: string = _(`Cannot do that in demo mode!`), name = `Error`) {
        super(message);
        this.name = name;
        Object.setPrototypeOf(this, PreventedInDemoError.prototype);
    }
}
