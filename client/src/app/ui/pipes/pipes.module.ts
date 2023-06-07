import { AsyncPipe, CommonModule, SlicePipe } from '@angular/common';
import { NgModule } from '@angular/core';

import { OpenSlidesAsyncPipe } from './async/openslides-async.pipe';
import { EntriesPipe } from './entries/entries.pipe';
import { LocalizedDatePipe } from './localized-date/localized-date.pipe';
import { LocalizedDateRangePipe } from './localized-date-range/localized-date-range.pipe';
import { ReadableBytesPipe } from './readable-bytes/readable-bytes.pipe';
import { ReversePipe } from './reverse/reverse.pipe';
import { OpenSlidesSlicePipe } from './slice/openslides-slice.pipe';
import { TimePipe } from './time/time.pipe';
import { ToArrayPipe } from './to-array/to-array.pipe';
import { ToStringPipe } from './to-string/to-string.pipe';
import { TrustPipe } from './trust/trust.pipe';

const DECLARATIONS = [
    LocalizedDatePipe,
    LocalizedDateRangePipe,
    TrustPipe,
    ReversePipe,
    ReadableBytesPipe,
    TimePipe,
    OpenSlidesSlicePipe,
    OpenSlidesAsyncPipe,
    EntriesPipe,
    ToStringPipe,
    ToArrayPipe
];

@NgModule({
    exports: DECLARATIONS,
    declarations: DECLARATIONS,
    imports: [CommonModule],
    providers: [
        { provide: SlicePipe, useClass: OpenSlidesSlicePipe },
        { provide: AsyncPipe, useClass: OpenSlidesAsyncPipe }
    ]
})
export class PipesModule {}
