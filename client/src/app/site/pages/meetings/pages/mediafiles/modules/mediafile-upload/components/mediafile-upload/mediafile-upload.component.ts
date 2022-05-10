import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MediafileControllerService } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-controller.service';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { Identifiable } from 'src/app/domain/interfaces';
import { Observable } from 'rxjs';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { GroupControllerService } from 'src/app/site/pages/meetings/pages/participants/modules';

@Component({
    selector: 'os-mediafile-upload',
    templateUrl: './mediafile-upload.component.html',
    styleUrls: ['./mediafile-upload.component.scss']
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

    public get currentDirectory(): ViewMediafile | null {
        if (this.directoryId) {
            return this.repo.getViewModel(this.directoryId);
        }
        return null;
    }

    public get uploadFn(): (file: any) => Promise<Identifiable> {
        return file => this.repo.createFile(file);
    }

    public get availableGroups(): Observable<ViewGroup[]> {
        return this.groupsRepo.getViewModelListObservable();
    }

    public constructor(
        private location: Location,
        private route: ActivatedRoute,
        private repo: MediafileControllerService,
        private groupsRepo: GroupControllerService
    ) {}

    public ngOnInit(): void {
        this.directoryId = this.route.snapshot.url.length > 0 ? +this.route.snapshot.url[0].path : null;
    }

    /**
     * Handler for successful uploads
     */
    public uploadSuccess(): void {
        this.location.back();
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
