import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailViewNavigatorComponent } from './detail-view-navigator.component';

xdescribe(`DetailViewNavigatorComponent`, () => {
    let component: DetailViewNavigatorComponent;
    let fixture: ComponentFixture<DetailViewNavigatorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DetailViewNavigatorComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DetailViewNavigatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
