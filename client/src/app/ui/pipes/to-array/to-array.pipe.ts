import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: `toArray`,
    standalone: false
})
export class ToArrayPipe implements PipeTransform {
    public transform<T>(value: T | T[]): T[] {
        if (Array.isArray(value)) {
            return value;
        }
        if (value === null || value === undefined) {
            return [];
        }
        return [value];
    }
}
