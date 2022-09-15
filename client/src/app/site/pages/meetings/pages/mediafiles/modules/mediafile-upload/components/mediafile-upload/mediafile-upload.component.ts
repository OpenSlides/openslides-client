import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { MediafileControllerService } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-controller.service';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { GroupControllerService } from 'src/app/site/pages/meetings/pages/participants/modules';
import { OrganizationMediafileUploadComponent } from 'src/app/site/pages/organization/pages/mediafiles/modules/organization-mediafile-upload/components/organization-mediafile-upload/organization-mediafile-upload.component';

import { MediafileCommonService } from '../../../../services/mediafile-common.service';

@Component({
    selector: `os-mediafile-upload`,
    templateUrl: `./mediafile-upload.component.html`,
    styleUrls: [`./mediafile-upload.component.scss`]
})
export class MediafileUploadComponent extends OrganizationMediafileUploadComponent implements OnInit {
    public availableGroups: Observable<ViewGroup[]> | null = null;

    public constructor(
        route: ActivatedRoute,
        repo: MediafileControllerService,
        private groupsRepo: GroupControllerService,
        commonService: MediafileCommonService
    ) {
        super(route, repo, commonService);
    }

    public override ngOnInit(): void {
        super.ngOnInit();
        this.availableGroups = this.groupsRepo.getViewModelListObservable();
    }
}
