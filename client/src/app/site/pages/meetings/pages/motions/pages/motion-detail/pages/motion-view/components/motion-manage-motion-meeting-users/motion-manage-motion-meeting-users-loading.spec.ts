import '@app/openslides-main-module/openslides-main.module';

import { Component, Input } from '@angular/core';
import {
    ChangeDetectorRef,
    createEnvironmentInjector,
    EnvironmentInjector,
    Injector,
    runInInjectionContext
} from '@angular/core';
import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { Selectable } from '@app/domain/interfaces';
import { ActionService } from '@app/gateways/actions';
import { GetForwardingCommitteesPresenterService } from '@app/gateways/presenter/get-forwarding-committees-presenter.service';
import { MotionRepositoryService } from '@app/gateways/repositories/motions/motion-repository.service';
import { ViewMotion } from '@app/site/pages/meetings/pages/motions';
import { ParticipantControllerService } from '@app/site/pages/meetings/pages/participants/services/common/participant-controller.service/participant-controller.service';
import { MeetingComponentServiceCollectorService } from '@app/site/pages/meetings/services/meeting-component-service-collector.service';
import { MeetingControllerService } from '@app/site/pages/meetings/services/meeting-controller.service';
import { OrganizationSettingsService } from '@app/site/pages/organization/services/organization-settings.service';
import { ComponentServiceCollectorService } from '@app/site/services/component-service-collector.service';
import { OperatorService } from '@app/site/services/operator.service';
import { TimeZoneService } from '@app/site/services/time-zone.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { MotionForwardDialogService } from '../../../../../../components/motion-forward-dialog/services/motion-forward-dialog.service';
import { MotionCategoryControllerService } from '../../../../../../modules/categories/services/motion-category-controller.service/motion-category-controller.service';
import { DiffServiceFactory } from '../../../../../../modules/change-recommendations/services/diff-factory.service';
import { MotionChangeRecommendationControllerService } from '../../../../../../modules/change-recommendations/services/motion-change-recommendation-controller.service/motion-change-recommendation-controller.service';
import { MotionEditorControllerService } from '../../../../../../modules/editors/services/motion-editor-controller/motion-editor-controller.service';
import { MotionBlockControllerService } from '../../../../../../modules/motion-blocks/services/motion-block-controller.service/motion-block-controller.service';
import { MotionSubmitterControllerService } from '../../../../../../modules/submitters/services/motion-submitter-controller/motion-submitter-controller.service';
import { TagControllerService } from '../../../../../../modules/tags/services/tag-controller.service/tag-controller.service';
import { MotionWorkingGroupSpeakerControllerService } from '../../../../../../modules/working-group-speakers/services/motion-working-group-speaker-controller/motion-working-group-speaker-controller.service';
import { AmendmentControllerService } from '../../../../../../services/common/amendment-controller.service/amendment-controller.service';
import { MotionControllerService } from '../../../../../../services/common/motion-controller.service/motion-controller.service';
import { MotionFormatService } from '../../../../../../services/common/motion-format.service/motion-format.service';
import { MotionLineNumberingService } from '../../../../../../services/common/motion-line-numbering.service/motion-line-numbering.service';
import { MotionPermissionService } from '../../../../../../services/common/motion-permission.service/motion-permission.service';
import { MotionDetailViewService } from '../../../../services/motion-detail-view.service/motion-detail-view.service';
import { MotionMetaDataComponent } from '../motion-meta-data/motion-meta-data.component';
import { MotionManageMotionMeetingUsersComponent } from './motion-manage-motion-meeting-users.component';

@Component({
    selector: `os-test-selector`,
    template: `
        <button [disabled]="!inputListValues.length">{{ inputListValues[0]?.getTitle() }}</button>
    `,
    standalone: false
})
class TestSelectorComponent {
    @Input() public inputListValues: Selectable[] = [];
}

@Component({
    template: `
        <os-motion-manage-motion-meeting-users
            field="submitters"
            [loadSecondSelectorValues]="load"
            [motion]="motion"
        ></os-motion-manage-motion-meeting-users>
    `,
    standalone: false
})
class TestHostComponent {
    public motion = { submitters: [] } as unknown as ViewMotion;
    public load: () => Promise<Selectable[]>;
}

describe(`MotionManageMotionMeetingUsersComponent committee loading`, () => {
    const committee = (id: number, name: string): Selectable => ({
        id,
        getTitle: () => name,
        getListTitle: () => name
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionManageMotionMeetingUsersComponent, TestHostComponent, TestSelectorComponent],
            providers: [
                UntypedFormBuilder,
                { provide: ParticipantControllerService, useValue: {} },
                { provide: MotionPermissionService, useValue: {} },
                { provide: MotionControllerService, useValue: {} },
                { provide: ActionService, useValue: {} }
            ]
        })
            .overrideComponent(MotionManageMotionMeetingUsersComponent, {
                set: {
                    template: `<button class="edit" (click)="onEdit()">Edit</button>
                        <button class="cancel" (click)="onCancel()">Cancel</button>
                        @if (isEditMode && loadSecondSelectorValues) {
                            <os-test-selector [inputListValues]="secondSelectorValues"></os-test-selector>
                        }`
                }
            })
            .compileComponents();
    });

    it(`enables the selector when the first asynchronous load finishes`, fakeAsync(() => {
        let resolve!: (items: Selectable[]) => void;
        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.componentInstance.load = () => new Promise(done => (resolve = done));
        fixture.detectChanges();
        fixture.nativeElement.querySelector(`.edit`).click();
        fixture.detectChanges();

        const selector: HTMLButtonElement = fixture.nativeElement.querySelector(`os-test-selector button`);
        expect(selector.disabled).toBeTrue();
        resolve([committee(1, `Committee A`)]);
        flushMicrotasks();
        fixture.detectChanges();
        expect(selector.disabled).toBeFalse();
        expect(selector.textContent).toContain(`Committee A`);
    }));

    it(`keeps the latest result if an earlier load finishes after reopening`, fakeAsync(() => {
        const pending: ((items: Selectable[]) => void)[] = [];
        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.componentInstance.load = () => new Promise(done => pending.push(done));
        fixture.detectChanges();
        fixture.nativeElement.querySelector(`.edit`).click();
        fixture.detectChanges();
        fixture.nativeElement.querySelector(`.cancel`).click();
        fixture.detectChanges();
        fixture.nativeElement.querySelector(`.edit`).click();
        fixture.detectChanges();

        pending[1]([committee(2, `Current committee`)]);
        flushMicrotasks();
        fixture.detectChanges();
        pending[0]([committee(1, `Old committee`)]);
        flushMicrotasks();
        fixture.detectChanges();
        const selector: HTMLButtonElement = fixture.nativeElement.querySelector(`os-test-selector button`);
        expect(selector.disabled).toBeFalse();
        expect(selector.textContent).toContain(`Current committee`);
    }));
});

describe(`MotionMetaDataComponent committee loader`, () => {
    it(`exposes the loader before forwarding meetings have finished loading`, fakeAsync(() => {
        let finishForwarding!: (value: boolean) => void;
        const forwarding = new Promise<boolean>(resolve => (finishForwarding = resolve));
        const presenter = jasmine.createSpy(`call`).and.resolveTo([`Committee A`]);
        const repo = { getViewModelListObservable: () => of([]) };
        const injector = createEnvironmentInjector(
            [
                { provide: ChangeDetectorRef, useValue: { markForCheck: () => {} } },
                { provide: ComponentServiceCollectorService, useValue: {} },
                {
                    provide: MeetingComponentServiceCollectorService,
                    useValue: {
                        meetingSettingsService: { get: () => of(false) },
                        activeMeetingService: { meetingId: 1 }
                    }
                },
                { provide: OrganizationSettingsService, useValue: {} },
                { provide: TranslateService, useValue: {} },
                { provide: MotionCategoryControllerService, useValue: repo },
                { provide: MotionControllerService, useValue: repo },
                { provide: MotionBlockControllerService, useValue: repo },
                { provide: TagControllerService, useValue: repo },
                ...[
                    AmendmentControllerService,
                    MotionChangeRecommendationControllerService,
                    MotionLineNumberingService,
                    DiffServiceFactory,
                    MotionFormatService,
                    MotionDetailViewService,
                    MotionPermissionService,
                    MeetingControllerService,
                    MotionSubmitterControllerService,
                    MotionEditorControllerService,
                    MotionWorkingGroupSpeakerControllerService,
                    TimeZoneService,
                    MotionRepositoryService
                ].map(provide => ({ provide, useValue: {} })),
                { provide: OperatorService, useValue: { hasPerms: () => true } },
                {
                    provide: MotionForwardDialogService,
                    useValue: { forwardingMeetingsAvailable: () => forwarding, forwardingCommitteesObservable: of([]) }
                },
                { provide: GetForwardingCommitteesPresenterService, useValue: { call: presenter } }
            ],
            Injector.NULL as EnvironmentInjector
        );

        const component = runInInjectionContext(injector, () => new MotionMetaDataComponent());
        expect(component.loadForwardingCommittees).toEqual(jasmine.any(Function));
        if (!component.loadForwardingCommittees) return;
        let names: string[] = [];
        component.loadForwardingCommittees().then(items => (names = items.map(item => item.getTitle())));
        expect(presenter).not.toHaveBeenCalled();
        finishForwarding(true);
        flushMicrotasks();
        expect(presenter).toHaveBeenCalledWith({ meeting_id: 1 });
        expect(names).toEqual([`Committee A`]);
    }));
});
