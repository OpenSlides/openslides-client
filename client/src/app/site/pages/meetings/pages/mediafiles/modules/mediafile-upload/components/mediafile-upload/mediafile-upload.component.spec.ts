import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediafileUploadComponent } from './mediafile-upload.component';

xdescribe(`MediafileUploadComponent`, () => {
    let component: MediafileUploadComponent;
    let fixture: ComponentFixture<MediafileUploadComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MediafileUploadComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MediafileUploadComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
