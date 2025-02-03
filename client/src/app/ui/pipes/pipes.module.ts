import { AsyncPipe, CommonModule, SlicePipe } from '@angular/common';
import { NgModule } from '@angular/core';

import { EntriesPipe } from './entries/entries.pipe';
import { LocalizedDatePipe } from './localized-date/localized-date.pipe';
import { LocalizedDateRangePipe } from './localized-date-range/localized-date-range.pipe';
import { ReadableBytesPipe } from './readable-bytes/readable-bytes.pipe';
import { ReversePipe } from './reverse/reverse.pipe';
import { TimePipe } from './time/time.pipe';
import { ToArrayPipe } from './to-array/to-array.pipe';
import { ToStringPipe } from './to-string/to-string.pipe';
import { TrustPipe } from './trust/trust.pipe';

const DECLARATIONS = [TrustPipe, ReversePipe, ReadableBytesPipe, TimePipe, EntriesPipe, ToArrayPipe];
const STANDALONES = [LocalizedDatePipe, LocalizedDateRangePipe, ToStringPipe];
const EXPORTS = [...DECLARATIONS, ...STANDALONES];

@NgModule({
    exports: EXPORTS,
    declarations: DECLARATIONS,
    imports: [CommonModule, ...STANDALONES],
    providers: [SlicePipe, AsyncPipe]
})
export class PipesModule {}
