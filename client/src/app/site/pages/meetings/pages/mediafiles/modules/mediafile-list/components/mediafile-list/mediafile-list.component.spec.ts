import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediafileListComponent } from './mediafile-list.component';

xdescribe(`MediafileListComponent`, () => {
    let component: MediafileListComponent;
    let fixture: ComponentFixture<MediafileListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MediafileListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MediafileListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
