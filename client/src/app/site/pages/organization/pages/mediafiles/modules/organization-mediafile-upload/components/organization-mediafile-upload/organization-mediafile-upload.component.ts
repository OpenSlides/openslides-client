import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { MediafileCommonService } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-common.service';
import { MediafileControllerService } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-controller.service';
import { UploadSuccessEvent } from 'src/app/ui/modules/media-upload-content/components/media-upload-content/media-upload-content.component';

@Component({
    selector: `os-organization-mediafile-upload`,
    templateUrl: `./organization-mediafile-upload.component.html`,
    styleUrls: [`./organization-mediafile-upload.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationMediafileUploadComponent implements OnInit {
    /**
     * Determine if uploading should happen parallel or synchronously.
     * Synchronous uploading might be necessary if we see that stuff breaks
     */
    public parallel = false;

    public directoryId: number | null = null;

    public directoriesObservable: Observable<ViewMediafile[]> | null = null;

    public get uploadFn(): (file: any) => Promise<Identifiable> {
        return file => this.repo.createFile(file);
    }

    private route = inject(ActivatedRoute);
    private repo = inject(MediafileControllerService);
    private commonService = inject(MediafileCommonService);

    public ngOnInit(): void {
        this.directoriesObservable = this.repo.getDirectoryListObservable();
        this.directoryId = this.route.snapshot.url.length > 0 ? +this.route.snapshot.url[0].path : null;
    }

    /**
     * Handler for successful uploads
     */
    public uploadSuccess(event: UploadSuccessEvent): void {
        this.commonService.navigateToDirectoryPage(this.repo.getViewModel(event.parentId));
    }

    /**
     * Handler for upload errors
     *
     * @param error
     */
    public showError(error: string): void {
        throw new Error(error);
    }
}
