import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HistoryListComponent } from './history-list.component';

xdescribe(`HistoryListComponent`, () => {
    let component: HistoryListComponent;
    let fixture: ComponentFixture<HistoryListComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [HistoryListComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HistoryListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
