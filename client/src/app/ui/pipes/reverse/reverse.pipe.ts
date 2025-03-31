import { Pipe, PipeTransform } from '@angular/core';

/**
 * Invert the order of arrays in templates
 *
 * @example
 * ```html
 * <li *ngFor="let user of users | reverse">
 *     {{ user.name }} has the id: {{ user.id }}
 * </li>
 * ```
 */
@Pipe({
    name: `reverse`,
    standalone: false
})
export class ReversePipe implements PipeTransform {
    public transform(value: any[]): any[] {
        return value.slice().reverse();
    }
}
