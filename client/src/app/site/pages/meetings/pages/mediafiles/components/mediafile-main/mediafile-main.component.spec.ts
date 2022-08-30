import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediafileMainComponent } from './mediafile-main.component';

xdescribe(`MediafileMainComponent`, () => {
    let component: MediafileMainComponent;
    let fixture: ComponentFixture<MediafileMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MediafileMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MediafileMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
