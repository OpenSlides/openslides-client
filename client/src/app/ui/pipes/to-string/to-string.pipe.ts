import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: `toString` })
export class ToStringPipe implements PipeTransform {
    public transform<T>(value?: number | string | T, key?: unknown): string {
        if (typeof value === `function`) {
            value = value();
        }
        if (typeof value === `number`) {
            return value.toString();
        }
        if (typeof value === `string`) {
            return value;
        }
        if (!value || !key) {
            return ``;
        }
        const indexedValue = value[key as keyof T];
        if (typeof indexedValue === `function`) {
            return String(indexedValue());
        }
        return String(indexedValue);
    }
}
