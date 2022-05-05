import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule, SlicePipe } from '@angular/common';
import { LocalizedDatePipe } from './localized-date/localized-date.pipe';
import { TrustPipe } from './trust/trust.pipe';
import { ReversePipe } from './reverse/reverse.pipe';
import { ReadableBytesPipe } from './readable-bytes/readable-bytes.pipe';
import { TimePipe } from './time/time.pipe';
import { OpenSlidesSlicePipe } from './slice/openslides-slice.pipe';
import { OpenSlidesAsyncPipe } from './async/openslides-async.pipe';
import { EntriesPipe } from './entries/entries.pipe';
import { ToStringPipe } from './to-string/to-string.pipe';

const DECLARATIONS = [
    LocalizedDatePipe,
    TrustPipe,
    ReversePipe,
    ReadableBytesPipe,
    TimePipe,
    OpenSlidesSlicePipe,
    OpenSlidesAsyncPipe,
    EntriesPipe,
    ToStringPipe
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
