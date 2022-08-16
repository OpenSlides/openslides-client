import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatGroupDetailMessageFormComponent } from './chat-group-detail-message-form.component';

xdescribe(`ChatGroupDetailMessageFormComponent`, () => {
    let component: ChatGroupDetailMessageFormComponent;
    let fixture: ComponentFixture<ChatGroupDetailMessageFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatGroupDetailMessageFormComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatGroupDetailMessageFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
