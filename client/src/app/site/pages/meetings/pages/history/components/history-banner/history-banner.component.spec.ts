import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryBannerComponent } from './history-banner.component';

xdescribe(`HistoryBannerComponent`, () => {
    let component: HistoryBannerComponent;
    let fixture: ComponentFixture<HistoryBannerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HistoryBannerComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HistoryBannerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
