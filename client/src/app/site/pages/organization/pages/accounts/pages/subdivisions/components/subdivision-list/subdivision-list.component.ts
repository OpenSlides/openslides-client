import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subdivision } from 'src/app/domain/models/subdivisions/subdivision';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { ViewSubdivision } from 'src/app/site/pages/organization/pages/accounts/pages/subdivisions/view-models/view-subdivision';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';

@Component({
    selector: `os-subdivision-list`,
    templateUrl: `./subdivision-list.component.html`,
    styleUrls: [`./subdivision-list.component.scss`]
})
export class SubdivisionListComponent extends BaseListViewComponent<ViewSubdivision> {
    public subdivisions: ViewSubdivision[] = [
        new ViewSubdivision(new Subdivision({ name: `test1`, id: 1 })),
        new ViewSubdivision(new Subdivision({ name: `test2`, id: 2 })),
        new ViewSubdivision(new Subdivision({ name: `test3`, id: 3 }))
    ];

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService
    ) {
        super(componentServiceCollector, translate);
        super.setTitle(`Subdivisions`);
        this.canMultiSelect = true;
    }

    public getSubdivisions(): ViewSubdivision[] {
        return this.subdivisions;
    }

    public createNewMember(): any {}
}
