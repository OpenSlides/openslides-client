import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentControlComponent } from './attachment-control.component';

xdescribe(`AttachmentControlComponent`, () => {
    let component: AttachmentControlComponent;
    let fixture: ComponentFixture<AttachmentControlComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AttachmentControlComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AttachmentControlComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
