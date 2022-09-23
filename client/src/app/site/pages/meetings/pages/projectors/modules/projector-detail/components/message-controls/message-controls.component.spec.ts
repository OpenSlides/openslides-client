import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageControlsComponent } from './message-controls.component';

xdescribe(`MessageControlsComponent`, () => {
    let component: MessageControlsComponent;
    let fixture: ComponentFixture<MessageControlsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MessageControlsComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MessageControlsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
