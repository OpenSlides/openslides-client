import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
    BehaviorSubject,
    filter,
    firstValueFrom,
    interval,
    lastValueFrom,
    map,
    Observable,
    startWith,
    takeUntil
} from 'rxjs';
import { SubscriptionConfig } from 'src/app/domain/interfaces/subscription-config';
import { ActionWorker, ActionWorkerState } from 'src/app/domain/models/action-worker/action-worker';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import { copy } from 'src/app/infrastructure/utils/transform-functions';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import {
    WaitForActionData,
    WaitForActionReason,
    waitForActionReason
} from 'src/app/site/modules/wait-for-action-dialog/definitions';
import { WaitForActionDialogService } from 'src/app/site/modules/wait-for-action-dialog/services';
import { ModelRequestService } from 'src/app/site/services/model-request.service';

import { ActionWorkerRepositoryService } from '../repositories/action-worker/action-worker-repository.service';
import { ViewActionWorker } from '../repositories/action-worker/view-action-worker';
import { ActionWorkerWatchService } from './action-worker-watch.service';
import { ACTION_WORKER_SUBSCRIPTION } from './action-worker-watch.subscription';

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

function createActionWorker(data: Partial<ActionWorker>): ViewActionWorker {
    let viewModel = new ViewActionWorker(new ActionWorker(data));
    viewModel = new Proxy(viewModel, {
        get: (target: ViewActionWorker, property) => {
            let result: any; // This is what we have to resolve: viewModel[property] -> result
            const _model: ActionWorker = target.getModel();

            // try to find a getter for property
            if (property in target) {
                // iterate over prototype chain
                let prototypeFunc = ViewActionWorker;
                let descriptor = null;
                do {
                    descriptor = Object.getOwnPropertyDescriptor(prototypeFunc.prototype, property);
                    if (!descriptor || !descriptor.get) {
                        prototypeFunc = Object.getPrototypeOf(prototypeFunc);
                    }
                } while (!(descriptor && descriptor.get) && prototypeFunc && prototypeFunc.prototype);

                if (descriptor && descriptor.get) {
                    // if getter was found in prototype chain, bind it with this proxy for right `this` access
                    result = descriptor.get.bind(viewModel)();
                } else {
                    result = target[property as keyof BaseViewModel];
                }
            } else if (property in _model) {
                result = _model[property as keyof BaseModel];
            }
            return result;
        }
    });
    return viewModel;
}

interface ActionWorkerData {
    id: number;
    created: number;
    timestamp: number;
    name: string;
    state: ActionWorkerState;
    result?: any;
}

function getStartActionWorkerData(id): ActionWorkerData {
    return {
        id,
        created: Date.now() / 1000,
        timestamp: Date.now() / 1000,
        name: `model.action`,
        state: ActionWorkerState.running
    };
}

function getUpdatedActionWorkerData(
    data: ActionWorkerData,
    newState: ActionWorkerState,
    result?: any
): ActionWorkerData {
    return {
        ...data,
        timestamp: Date.now() / 1000,
        state: newState,
        result
    };
}

class MockWaitForActionDialogService {
    public closingPromptOpenFor: (Partial<ActionWorker> & { closed: number })[] = [];
    public currentDialogs = new BehaviorSubject<{
        [workerId: number]: { reason: WaitForActionReason; data: WaitForActionData };
    }>({});

    public constructor() {}

    public removeAllDates(workerId: number): void {
        const currentDialogs = copy(this.currentDialogs.value);
        delete currentDialogs[workerId];
        this.currentDialogs.next(currentDialogs);
    }
    public async openClosingPrompt(snapshot: Partial<ActionWorker> & { closed: number }): Promise<void> {
        this.closingPromptOpenFor.push(snapshot);
    }
    public addNewDialog(reason: WaitForActionReason, data: WaitForActionData): void {
        const currentDialogs = copy(this.currentDialogs.value);
        currentDialogs[data.workerId] = { reason, data };
        this.currentDialogs.next(currentDialogs);
    }
}

class MockModelRequestService {
    public currentSubscriptions = new BehaviorSubject<{ [subscriptionName: string]: SubscriptionConfig<any> }>({});

    public constructor() {}

    public async updateSubscribeTo(config: SubscriptionConfig<any>): Promise<void> {
        this.currentSubscriptions.next({ ...this.currentSubscriptions.value, [config.subscriptionName]: config });
    }

    public closeSubscription(subscriptionName: string): void {
        const current = this.currentSubscriptions.value;
        delete current[subscriptionName];
        this.currentSubscriptions.next(current);
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

describe(`ActionWorkerWatchService`, () => {
    let service: ActionWorkerWatchService;
    let dialog: MockWaitForActionDialogService;
    let modelRequest: MockModelRequestService;
    let repo: MockActionWorkerRepositoryService;
    let startData: ActionWorkerData;

    const dialogTestCases: { test: string; gap: number; dialogExpectation: WaitForActionReason[] }[] = [
        { test: `is slow`, gap: 3000, dialogExpectation: [waitForActionReason.slow] },
        { test: `is inactive`, gap: 21000, dialogExpectation: [waitForActionReason.inactive] }
    ];

    const durationTestCases: { test: string; gap: number; dialogExpectation: WaitForActionReason[] }[] = [
        { test: `takes long but isn't slow`, gap: 1000, dialogExpectation: undefined }
    ].concat(dialogTestCases);

    const unsubscribeFunctions: { funct: (service: ActionWorkerWatchService) => Promise<void>; title: string }[] = [
        { title: `unsubscribeFromWorker`, funct: async service => service.unsubscribeFromWorker(startData.id) },
        { title: `unsubscribeFromWorkers`, funct: async service => service.unsubscribeFromWorkers([startData.id]) },
        { title: `unsubscribeFromAllWorkers`, funct: async service => service.unsubscribeFromAllWorkers() }
    ];

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
        jasmine.clock().install();
        jasmine.clock().mockDate(new Date());
        startData = getStartActionWorkerData(42);
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it(`watch worker that wasn't written`, async () => {
        await expectAsync(
            service.watch(createHttpResponse(`model.action`, `action_worker/42`, false), true)
        ).toBeRejectedWith(
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

    it(`watch worker with broken fqid`, async () => {
        await expectAsync(
            service.watch(createHttpResponse(`model.action`, `action_worker/fourtytwo`, false), true)
        ).toBeRejectedWithError(`Received invalid fqid for action worker: model.action`);
    });

    it(`watch worker that resolves quickly`, async () => {
        const subscriptionPromise = firstValueFrom(
            modelRequest.currentSubscriptions.pipe(filter(subscriptions => !!Object.keys(subscriptions).length))
        );
        const originalResponse = createHttpResponse(startData.name, `action_worker/${startData.id}`, true);
        const watchPromise = service.watch(originalResponse, true);
        expect(Object.keys(await subscriptionPromise).length).toBe(1);
        expect((await subscriptionPromise)[ACTION_WORKER_SUBSCRIPTION]).not.toBeFalsy();
        expect(service.currentWorkerIds).toEqual([startData.id]);
        repo.viewModelList = [createActionWorker(startData)];
        jasmine.clock().tick(1000);
        const result = {
            success: true,
            status_code: 200,
            message: `Actions handled successfully`,
            data: `I have a result`
        };
        repo.viewModelList = [createActionWorker(getUpdatedActionWorkerData(startData, ActionWorkerState.end, result))];
        jasmine.clock().tick(1000);
        await expectAsync(watchPromise).toBeResolvedTo(
            new HttpResponse({
                body: result,
                headers: originalResponse.headers,
                status: 200,
                url: originalResponse.url,
                statusText: result.message
            })
        );
        expect(service.currentWorkerIds).toEqual([]);
    });

    it(`watch worker that fails`, async () => {
        const subscriptionPromise = firstValueFrom(
            modelRequest.currentSubscriptions.pipe(filter(subscriptions => !!Object.keys(subscriptions).length))
        );
        const originalResponse = createHttpResponse(startData.name, `action_worker/${startData.id}`, true);
        const watchPromise = service.watch(originalResponse, true);
        await subscriptionPromise;
        repo.viewModelList = [createActionWorker(startData)];
        jasmine.clock().tick(1000);
        const result = {
            success: false,
            status_code: 500,
            message: `Actions handled unsuccessfully`
        };
        repo.viewModelList = [createActionWorker(getUpdatedActionWorkerData(startData, ActionWorkerState.end, result))];
        jasmine.clock().tick(1000);
        await expectAsync(watchPromise).toBeRejectedWith(
            new HttpErrorResponse({
                error: result,
                status: 500,
                url: originalResponse.url,
                statusText: result.message
            })
        );
        expect(service.currentWorkerIds).toEqual([]);
    });

    it(`watch worker that aborts`, async () => {
        const subscriptionPromise = firstValueFrom(
            modelRequest.currentSubscriptions.pipe(filter(subscriptions => !!Object.keys(subscriptions).length))
        );
        const originalResponse = createHttpResponse(startData.name, `action_worker/${startData.id}`, true);
        const watchPromise = service.watch(originalResponse, true);
        await subscriptionPromise;
        repo.viewModelList = [createActionWorker(startData)];
        jasmine.clock().tick(1000);
        const result = {
            success: false,
            status_code: 500,
            message: `Actions handled unsuccessfully`
        };
        repo.viewModelList = [
            createActionWorker(getUpdatedActionWorkerData(startData, ActionWorkerState.aborted, result))
        ];
        jasmine.clock().tick(1000);
        await expectAsync(watchPromise).toBeRejectedWith(
            new HttpErrorResponse({
                error: {
                    success: false,
                    message: `model.action aborted without any specific message`,
                    url: originalResponse.url
                },
                status: 500,
                statusText: `Actions handled unsuccessfully`
            })
        );
        expect(service.currentWorkerIds).toEqual([]);
    });

    it(`watch worker that takes a while to load`, async () => {
        const subscriptionPromise = firstValueFrom(
            modelRequest.currentSubscriptions.pipe(filter(subscriptions => !!Object.keys(subscriptions).length))
        );
        const originalResponse = createHttpResponse(startData.name, `action_worker/${startData.id}`, true);
        const watchPromise = service.watch(originalResponse, true);
        expect(Object.keys(await subscriptionPromise).length).toBe(1);
        expect((await subscriptionPromise)[ACTION_WORKER_SUBSCRIPTION]).not.toBeFalsy();
        expect(service.currentWorkerIds).toEqual([startData.id]);
        jasmine.clock().tick(2500);
        repo.viewModelList = [createActionWorker(startData)];
        jasmine.clock().tick(1000);
        const result = {
            success: true,
            status_code: 200,
            message: `Actions handled successfully`,
            data: `I have a result`
        };
        repo.viewModelList = [createActionWorker(getUpdatedActionWorkerData(startData, ActionWorkerState.end, result))];
        jasmine.clock().tick(1000);
        await expectAsync(watchPromise).toBeResolvedTo(
            new HttpResponse({
                body: result,
                headers: originalResponse.headers,
                status: 200,
                url: originalResponse.url,
                statusText: result.message
            })
        );
        expect(service.currentWorkerIds).toEqual([]);
    });

    for (const test of durationTestCases) {
        it(`watch worker that ${test.test}`, async () => {
            const subscriptionPromise = firstValueFrom(
                modelRequest.currentSubscriptions.pipe(filter(subscriptions => !!Object.keys(subscriptions).length))
            );
            const originalResponse = createHttpResponse(startData.name, `action_worker/${startData.id}`, true);
            const watchPromise = service.watch(originalResponse, true);
            expect((await subscriptionPromise)[ACTION_WORKER_SUBSCRIPTION]).not.toBeFalsy();
            repo.viewModelList = [createActionWorker(startData)];
            jasmine.clock().tick(1000);
            repo.viewModelList = [createActionWorker(getUpdatedActionWorkerData(startData, ActionWorkerState.running))];
            const time = Date.now();
            const dialogPromise = lastValueFrom(
                dialog.currentDialogs.pipe(
                    filter(dialogs => !!Object.keys(dialogs).length),
                    map(dialogs => Object.values(dialogs).map(dialog => dialog.reason)),
                    startWith(undefined),
                    takeUntil(interval(500).pipe(filter(() => Date.now() - time >= test.gap + 1500)))
                )
            );
            jasmine.clock().tick(test.gap);
            const result = {
                success: true,
                status_code: 200,
                message: `Actions handled successfully`,
                data: `I have a result`
            };
            repo.viewModelList = [
                createActionWorker(getUpdatedActionWorkerData(startData, ActionWorkerState.end, result))
            ];
            jasmine.clock().tick(1500);
            await expectAsync(watchPromise).toBeResolvedTo(
                new HttpResponse({
                    body: result,
                    headers: originalResponse.headers,
                    status: 200,
                    url: originalResponse.url,
                    statusText: result.message
                })
            );
            await expectAsync(dialogPromise).toBeResolvedTo(test.dialogExpectation);
        });

        it(`watch worker that ${test.test} when wait dialog is disabled`, async () => {
            service.disableWaitDialog(startData.name);
            const subscriptionPromise = firstValueFrom(
                modelRequest.currentSubscriptions.pipe(filter(subscriptions => !!Object.keys(subscriptions).length))
            );
            const originalResponse = createHttpResponse(startData.name, `action_worker/${startData.id}`, true);
            const watchPromise = service.watch(originalResponse, true);
            expect((await subscriptionPromise)[ACTION_WORKER_SUBSCRIPTION]).not.toBeFalsy();
            repo.viewModelList = [createActionWorker(startData)];
            jasmine.clock().tick(1000);
            repo.viewModelList = [createActionWorker(getUpdatedActionWorkerData(startData, ActionWorkerState.running))];
            const time = Date.now();
            const dialogPromise = lastValueFrom(
                dialog.currentDialogs.pipe(
                    filter(dialogs => !!Object.keys(dialogs).length),
                    map(dialogs => Object.values(dialogs).map(dialog => dialog.reason)),
                    startWith(undefined),
                    takeUntil(interval(500).pipe(filter(() => Date.now() - time >= test.gap + 1500)))
                )
            );
            jasmine.clock().tick(test.gap);
            const result = {
                success: true,
                status_code: 200,
                message: `Actions handled successfully`,
                data: `I have a result`
            };
            repo.viewModelList = [
                createActionWorker(getUpdatedActionWorkerData(startData, ActionWorkerState.end, result))
            ];
            jasmine.clock().tick(1500);
            await expectAsync(watchPromise).toBeResolvedTo(
                new HttpResponse({
                    body: result,
                    headers: originalResponse.headers,
                    status: 200,
                    url: originalResponse.url,
                    statusText: result.message
                })
            );
            await expectAsync(dialogPromise).toBeResolvedTo(undefined);
            service.enableWaitDialog(startData.name);
        });

        it(`watch worker that ${test.test} when wait dialog is re-enabled`, async () => {
            service.disableWaitDialog(startData.name);
            service.disableWaitDialog(`another.action`);
            service.enableWaitDialog(startData.name);
            const subscriptionPromise = firstValueFrom(
                modelRequest.currentSubscriptions.pipe(filter(subscriptions => !!Object.keys(subscriptions).length))
            );
            const originalResponse = createHttpResponse(startData.name, `action_worker/${startData.id}`, true);
            const watchPromise = service.watch(originalResponse, true);
            expect((await subscriptionPromise)[ACTION_WORKER_SUBSCRIPTION]).not.toBeFalsy();
            repo.viewModelList = [createActionWorker(startData)];
            jasmine.clock().tick(1000);
            repo.viewModelList = [createActionWorker(getUpdatedActionWorkerData(startData, ActionWorkerState.running))];
            const time = Date.now();
            const dialogPromise = lastValueFrom(
                dialog.currentDialogs.pipe(
                    filter(dialogs => !!Object.keys(dialogs).length),
                    map(dialogs => Object.values(dialogs).map(dialog => dialog.reason)),
                    startWith(undefined),
                    takeUntil(interval(500).pipe(filter(() => Date.now() - time >= test.gap + 1500)))
                )
            );
            jasmine.clock().tick(test.gap);
            const result = {
                success: true,
                status_code: 200,
                message: `Actions handled successfully`,
                data: `I have a result`
            };
            repo.viewModelList = [
                createActionWorker(getUpdatedActionWorkerData(startData, ActionWorkerState.end, result))
            ];
            jasmine.clock().tick(1500);
            await expectAsync(watchPromise).toBeResolvedTo(
                new HttpResponse({
                    body: result,
                    headers: originalResponse.headers,
                    status: 200,
                    url: originalResponse.url,
                    statusText: result.message
                })
            );
            await expectAsync(dialogPromise).toBeResolvedTo(test.dialogExpectation);
        });
    }

    for (let i = 0; i < Math.max(dialogTestCases.length, unsubscribeFunctions.length); i++) {
        const test = dialogTestCases[i % dialogTestCases.length];
        const unsubscribeFunction = unsubscribeFunctions[i % unsubscribeFunctions.length];
        it(`watch worker that ${test.test} and is stopped with ${unsubscribeFunction.title}`, async () => {
            const subscriptionPromise = firstValueFrom(
                modelRequest.currentSubscriptions.pipe(filter(subscriptions => !!Object.keys(subscriptions)?.length))
            );
            const originalResponse = createHttpResponse(startData.name, `action_worker/${startData.id}`, true);
            const watchPromise = service.watch(originalResponse, true);
            expect((await subscriptionPromise)[ACTION_WORKER_SUBSCRIPTION]).not.toBeFalsy();
            repo.viewModelList = [createActionWorker(startData)];
            jasmine.clock().tick(1000);
            repo.viewModelList = [createActionWorker(getUpdatedActionWorkerData(startData, ActionWorkerState.running))];
            jasmine.clock().tick(test.gap);
            expect(Object.values(dialog.currentDialogs.value).map(dialog => dialog.reason)).toEqual(
                test.dialogExpectation
            );
            await unsubscribeFunction.funct(service);
            jasmine.clock().tick(1500);
            await expectAsync(watchPromise).toBeRejectedWithError(
                `Client has stopped watching worker "model.action": Stopped listening`
            );
        });
    }

    it(`watch worker that doesn't update until the kill threshold`, async () => {
        const subscriptionPromise = firstValueFrom(
            modelRequest.currentSubscriptions.pipe(filter(subscriptions => !!Object.keys(subscriptions)?.length))
        );
        const originalResponse = createHttpResponse(startData.name, `action_worker/${startData.id}`, true);
        const watchPromise = service.watch(originalResponse, true);
        expect((await subscriptionPromise)[ACTION_WORKER_SUBSCRIPTION]).not.toBeFalsy();
        repo.viewModelList = [createActionWorker(startData)];
        jasmine.clock().tick(1000);
        repo.viewModelList = [createActionWorker(getUpdatedActionWorkerData(startData, ActionWorkerState.running))];
        jasmine.clock().tick(60 * 1000 + 2000);
        await expectAsync(watchPromise).toBeRejectedWithError(
            `Client has stopped watching worker "model.action": Process has been assumed to be dead`
        );
        expect(dialog.closingPromptOpenFor.map(worker => worker.id)).toEqual([startData.id]);
        expect(service.currentWorkerIds).toEqual([]);
    });

    it(`watch worker with two inactivity dialogs`, async () => {
        const subscriptionPromise = firstValueFrom(
            modelRequest.currentSubscriptions.pipe(filter(subscriptions => !!Object.keys(subscriptions).length))
        );
        const originalResponse = createHttpResponse(startData.name, `action_worker/${startData.id}`, true);
        service.watch(originalResponse, true);
        expect((await subscriptionPromise)[ACTION_WORKER_SUBSCRIPTION]).not.toBeFalsy();
        repo.viewModelList = [createActionWorker(startData)];
        jasmine.clock().tick(1000);
        repo.viewModelList = [createActionWorker(getUpdatedActionWorkerData(startData, ActionWorkerState.running))];
        jasmine.clock().tick(21000);
        expect(Object.values(dialog.currentDialogs.value).map(dialog => dialog.reason)).toEqual([
            waitForActionReason.inactive
        ]);
        dialog.currentDialogs.next({});
        service.setWaitingConfirmed(startData.id);
        for (let i = 0; i < 60 * 1000 * 4 + 2000; i = i + 30 * 1000) {
            repo.viewModelList = [createActionWorker(getUpdatedActionWorkerData(startData, ActionWorkerState.running))];
            jasmine.clock().tick(30 * 1000);
        }
        expect(Object.values(dialog.currentDialogs.value).map(dialog => dialog.reason)).toEqual([]);
        for (let i = 0; i < 60 * 1000; i = i + 30 * 1000) {
            repo.viewModelList = [createActionWorker(getUpdatedActionWorkerData(startData, ActionWorkerState.running))];
            jasmine.clock().tick(30 * 1000);
        }
        expect(Object.values(dialog.currentDialogs.value).map(dialog => dialog.reason)).toEqual([
            waitForActionReason.inactive
        ]);
    });

    it(`test worker cleanup`, async () => {
        const subscriptionPromise = firstValueFrom(
            modelRequest.currentSubscriptions.pipe(filter(subscriptions => !!Object.keys(subscriptions).length))
        );
        const originalResponse = createHttpResponse(startData.name, `action_worker/${startData.id}`, true);
        const watchPromise = service.watch(originalResponse, true);
        await subscriptionPromise;
        repo.viewModelList = [createActionWorker(startData)];
        jasmine.clock().tick(1000);
        const result = {
            success: true,
            status_code: 200,
            message: `Actions handled successfully`,
            data: `I have a result`
        };
        repo.viewModelList = [createActionWorker(getUpdatedActionWorkerData(startData, ActionWorkerState.end, result))];
        jasmine.clock().tick(1000);
        await watchPromise;
        expect(service.currentWorkerIds).toEqual([]);
        expect(modelRequest.currentSubscriptions.value).toEqual({});
        jasmine.clock().tick(11000);
        // Second action worker ten seconds after closing should cause the previous to be deleted from the repo
        startData = getStartActionWorkerData(43);
        const subscriptionPromise2 = firstValueFrom(
            modelRequest.currentSubscriptions.pipe(filter(subscriptions => !!Object.keys(subscriptions).length))
        );
        const originalResponse2 = createHttpResponse(startData.name, `action_worker/${startData.id}`, true);
        const watchPromise2 = service.watch(originalResponse2, true);
        await subscriptionPromise2;
        repo.viewModelList = [createActionWorker(startData)];
        jasmine.clock().tick(1000);
        const result2 = {
            success: true,
            status_code: 200,
            message: `Actions handled successfully`,
            data: `I have a result`
        };
        repo.viewModelList = [
            createActionWorker(getUpdatedActionWorkerData(startData, ActionWorkerState.end, result2))
        ];
        jasmine.clock().tick(1000);
        await watchPromise2;
        expect(service.currentWorkerIds).toEqual([]);
        expect(repo.getViewModelList().length).toBeLessThan(2);
    });
});
