import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { SubscriptionConfig } from 'src/app/domain/interfaces/subscription-config';
import { ActionWorker } from 'src/app/domain/models/action-worker/action-worker';
import { WaitForActionData, WaitForActionReason } from 'src/app/site/modules/wait-for-action-dialog/definitions';
import { WaitForActionDialogService } from 'src/app/site/modules/wait-for-action-dialog/services';
import { ModelRequestService } from 'src/app/site/services/model-request.service';

import { ActionWorkerRepositoryService } from '../repositories/action-worker/action-worker-repository.service';
import { ViewActionWorker } from '../repositories/action-worker/view-action-worker';
import { ActionWorkerWatchService } from './action-worker-watch.service';

function createHttpResponse(
    name: string,
    fqid: string,
    written: boolean,
    httpMetaData?: { headers?: HttpHeaders; status?: number; statusText?: string; url?: string }
) {
    const { headers, status, statusText, url } = httpMetaData ?? {};
    return new HttpResponse({
        body: { results: [[{ name, fqid, written }]] },
        url,
        headers,
        status,
        statusText
    });
}

class MockWaitForActionDialogService {
    public closingPromptOpenFor: (Partial<ActionWorker> & { closed: number })[] = [];
    public currentDialogs: { [workerId: number]: { reason: WaitForActionReason; data: WaitForActionData } } = [];

    public constructor() {}

    public removeAllDates(workerId: number): void {
        delete this.currentDialogs[workerId];
    }
    public async openClosingPrompt(snapshot: Partial<ActionWorker> & { closed: number }): Promise<void> {
        this.closingPromptOpenFor.push(snapshot);
    }
    public addNewDialog(reason: WaitForActionReason, data: WaitForActionData): void {
        this.currentDialogs[data.workerId] = { reason, data };
    }
}

class MockModelRequestService {
    public currentSubscriptions: { [subscriptionName: string]: SubscriptionConfig<any> } = {};

    public constructor() {}

    public async updateSubscribeTo(config: SubscriptionConfig<any>): Promise<void> {
        this.currentSubscriptions[config.subscriptionName] = config;
    }

    public closeSubscription(subscriptionName: string): void {
        delete this.currentSubscriptions[subscriptionName];
    }
}

class MockActionWorkerRepositoryService {
    public set viewModelList(list: ViewActionWorker[]) {
        this._viewModelListSubject.next(list);
    }
    public get viewModelList(): ViewActionWorker[] {
        return this._viewModelListSubject.value;
    }

    public invisibleIds: number[] = [];

    private _viewModelListSubject = new BehaviorSubject<ViewActionWorker[]>([]);

    public constructor() {}

    public getViewModelListObservable(): Observable<ViewActionWorker[]> {
        return this._viewModelListSubject.pipe(map(list => this.getVisible(list)));
    }

    public getViewModelObservable(id: number): Observable<ViewActionWorker> {
        return this._viewModelListSubject.pipe(map(list => this.getVisible(list).find(worker => worker.id === id)));
    }

    public getViewModelList(): ViewActionWorker[] {
        return this.getVisible(this._viewModelListSubject.value);
    }

    public getViewModel(id: number): ViewActionWorker {
        return this.getVisible(this._viewModelListSubject.value).find(worker => worker.id === id);
    }

    public deleteModels(toDelete: number[]): void {
        this.invisibleIds = Array.from(new Set(this.invisibleIds.concat(toDelete)).values());
        this._viewModelListSubject.next(this._viewModelListSubject.value);
    }

    private getVisible(list: ViewActionWorker[]): ViewActionWorker[] {
        return list.filter(item => !this.invisibleIds.includes(item.id));
    }
}

fdescribe(`ActionWorkerWatchService`, () => {
    let service: ActionWorkerWatchService;
    let dialog: MockWaitForActionDialogService;
    let modelRequest: MockModelRequestService;
    let repo: MockActionWorkerRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ActionWorkerWatchService,
                { provide: WaitForActionDialogService, useClass: MockWaitForActionDialogService },
                { provide: ModelRequestService, useClass: MockModelRequestService },
                { provide: ActionWorkerRepositoryService, useClass: MockActionWorkerRepositoryService }
            ]
        });

        service = TestBed.inject(ActionWorkerWatchService);
        dialog = TestBed.inject(WaitForActionDialogService) as unknown as MockWaitForActionDialogService;
        modelRequest = TestBed.inject(ModelRequestService) as unknown as MockModelRequestService;
        repo = TestBed.inject(ActionWorkerRepositoryService) as unknown as MockActionWorkerRepositoryService;
    });

    it(`test action worker watch for worker that wasn't written`, async () => {
        await expectAsync(service.watch(createHttpResponse(`model.action`, `model/42`, false), true)).toBeRejectedWith(
            new HttpErrorResponse({
                error: {
                    success: false,
                    message: `Worker for model.action could not be written on time, however the action may still be completed. Please check the results manually.`,
                    url: null
                },
                status: 500
            })
        );
    });
});
