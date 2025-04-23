import { Pipe, PipeTransform } from '@angular/core';
import { PollValues } from 'src/app/domain/models/poll';

/**
 * Pipe to transform a key from polls into a speaking word.
 */
@Pipe({
    name: `pollKeyVerbose`
})
export class PollKeyVerbosePipe implements PipeTransform {
    public transform(value: string): string {
        return PollValues[value] || value;
    }
}
