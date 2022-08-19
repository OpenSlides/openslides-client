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

    // public get uploadFn(): (file: any) => Promise<Identifiable> {
    //     return file => this.repo.createFile(file);
    // }

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

    // /**
    //  * Handler for successful uploads
    //  */
    // public uploadSuccess(event: UploadSuccessEvent): void {
    //     const parts = [this.activeMeetingIdService.meetingId, `mediafiles`];
    //     if (event.parentId) {
    //         parts.push(event.parentId);
    //     }
    //     this.router.navigate(parts);
    // }

    // /**
    //  * Handler for upload errors
    //  *
    //  * @param error
    //  */
    // public showError(error: string): void {
    //     // this.raiseError(error);
    // }

    // /**
    //  * Changes the upload strategy between synchronous and parallel
    //  *
    //  * @param isParallel true or false, whether parallel upload is required or not
    //  */
    // public setUploadStrategy(isParallel: boolean): void {
    //     this.parallel = isParallel;
    // }
}
