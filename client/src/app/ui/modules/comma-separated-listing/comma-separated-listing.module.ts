import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CommaSeparatedListingComponent } from './components/comma-separated-listing/comma-separated-listing.component';

@NgModule({
    declarations: [CommaSeparatedListingComponent],
    exports: [CommaSeparatedListingComponent],
    imports: [CommonModule]
})
export class CommaSeparatedListingModule {}
