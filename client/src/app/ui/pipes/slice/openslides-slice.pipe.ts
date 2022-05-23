import { Pipe, PipeTransform } from '@angular/core';

/**
 * Just copied from: https://github.com/angular/angular/blob/master/packages/common/src/pipes/slice_pipe.ts.
 * This is because the "original" pipe does not take arguments as "any", instead they're "unknown".
 */
@Pipe({
    name: `slice`
})
export class OpenSlidesSlicePipe implements PipeTransform {
    /**
     * @param value a list or a string to be sliced.
     * @param start the starting index of the subset to return:
     *   - **a positive integer**: return the item at `start` index and all items after
     *     in the list or string expression.
     *   - **a negative integer**: return the item at `start` index from the end and all items after
     *     in the list or string expression.
     *   - **if positive and greater than the size of the expression**: return an empty list or
     * string.
     *   - **if negative and greater than the size of the expression**: return entire list or string.
     * @param end the ending index of the subset to return:
     *   - **omitted**: return all items until the end.
     *   - **if positive**: return all items before `end` index of the list or string.
     *   - **if negative**: return all items before `end` index from the end of the list or string.
     */
    transform<T = any>(value: ReadonlyArray<T>, start: number, end?: number): Array<T>;
    transform(value: null | undefined, start: number, end?: number): null;
    transform<T = any>(value: ReadonlyArray<T> | null | undefined, start: number, end?: number): Array<T> | null;
    transform(value: string, start: number, end?: number): string;
    transform(value: string | null | undefined, start: number, end?: number): string | null;
    transform<T>(
        value: ReadonlyArray<T> | string | null | undefined,
        start: number,
        end?: number
    ): Array<T> | string | null {
        if (value == null) return null;

        if (!this.isSupported(value)) {
            throw new Error(
                `Invalid argument for slice received. Expected "string" or "Array", received ${typeof value}`
            );
        }

        return value.slice(start, end);
    }

    private isSupported(obj: any): boolean {
        return typeof obj === `string` || Array.isArray(obj);
    }
}
