import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { GroupControllerService } from 'src/app/site/pages/meetings/pages/participants/modules';
import { OrganizationMediafileUploadComponent } from 'src/app/site/pages/organization/pages/mediafiles/modules/organization-mediafile-upload/components/organization-mediafile-upload/organization-mediafile-upload.component';

@Component({
    selector: `os-mediafile-upload`,
    templateUrl: `./mediafile-upload.component.html`,
    styleUrls: [`./mediafile-upload.component.scss`]
})
export class MediafileUploadComponent extends OrganizationMediafileUploadComponent implements OnInit {
    public availableGroups: Observable<ViewGroup[]> | null = null;

    private groupsRepo = inject(GroupControllerService);

    public override ngOnInit(): void {
        super.ngOnInit();
        this.availableGroups = this.groupsRepo.getViewModelListObservable();
    }
}
