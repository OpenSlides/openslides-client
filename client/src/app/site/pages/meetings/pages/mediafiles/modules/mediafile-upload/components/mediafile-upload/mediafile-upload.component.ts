import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { MediafileControllerService } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-controller.service';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { GroupControllerService } from 'src/app/site/pages/meetings/pages/participants/modules';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { UploadSuccessEvent } from 'src/app/ui/modules/media-upload-content/components/media-upload-content/media-upload-content.component';

@Component({
    selector: `os-mediafile-upload`,
    templateUrl: `./mediafile-upload.component.html`,
    styleUrls: [`./mediafile-upload.component.scss`]
})
export class MediafileUploadComponent implements OnInit {
    /**
     * Determine if uploading should happen parallel or synchronously.
     * Synchronous uploading might be necessary if we see that stuff breaks
     */
    public parallel = true;

    public directoryId: number | null = null;

    public get directoriesObservable(): Observable<ViewMediafile[]> {
        return this.repo.getDirectoryListObservable();
    }

    public get uploadFn(): (file: any) => Promise<Identifiable> {
        return file => this.repo.createFile(file);
    }

    public get availableGroups(): Observable<ViewGroup[]> {
        return this.groupsRepo.getViewModelListObservable();
    }

    public constructor(
        private router: Router,
        private route: ActivatedRoute,
        private repo: MediafileControllerService,
        private groupsRepo: GroupControllerService,
        private activeMeetingIdService: ActiveMeetingIdService
    ) {}

    public ngOnInit(): void {
        this.directoryId = this.route.snapshot.url.length > 0 ? +this.route.snapshot.url[0].path : null;
    }

    /**
     * Handler for successful uploads
     */
    public uploadSuccess(event: UploadSuccessEvent): void {
        const parts = [this.activeMeetingIdService.meetingId, `mediafiles`];
        if (event.parentId) {
            parts.push(event.parentId);
        }
        this.router.navigate(parts);
    }

    /**
     * Handler for upload errors
     *
     * @param error
     */
    public showError(error: string): void {
        // this.raiseError(error);
    }

    /**
     * Changes the upload strategy between synchronous and parallel
     *
     * @param isParallel true or false, whether parallel upload is required or not
     */
    public setUploadStrategy(isParallel: boolean): void {
        this.parallel = isParallel;
    }
}
