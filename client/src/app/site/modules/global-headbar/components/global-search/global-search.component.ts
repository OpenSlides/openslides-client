import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { GlobalSearchEntry, GlobalSearchService } from 'src/app/site/services/global-search.service';
@Component({
    selector: `os-global-search`,
    templateUrl: `./global-search.component.html`,
    styleUrls: [`./global-search.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalSearchComponent {
    public searchTerm = ``;

    public readonly availableFilters = {
        committee: `Committees`,
        meeting: `Meetings`,
        motion: `Motions`,
        assignment: `Elections`,
        mediafile: `Files`,
        user: `Participants`
    };

    public currentFilters = this.formBuilder.group(
        Object.fromEntries(Object.keys(this.availableFilters).map(field => [field, true]))
    );

    public results: { [key: string]: GlobalSearchEntry[] } = {};

    public constructor(
        private globalSearchService: GlobalSearchService,
        private formBuilder: FormBuilder,
        private cd: ChangeDetectorRef
    ) {}

    public async searchChange() {
        this.results = await this.globalSearchService.searchChange(
            this.searchTerm,
            Object.keys(this.availableFilters).filter(
                field => this.currentFilters.get(field) && this.currentFilters.get(field).getRawValue()
            )
        );
        this.cd.markForCheck();
    }
}
