import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailViewNotFoundComponent } from './detail-view-not-found.component';

xdescribe(`DetailViewNotFoundComponent`, () => {
    let component: DetailViewNotFoundComponent;
    let fixture: ComponentFixture<DetailViewNotFoundComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DetailViewNotFoundComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DetailViewNotFoundComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
