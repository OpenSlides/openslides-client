import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatGroupDetailMessageComponent } from './chat-group-detail-message.component';

xdescribe(`ChatGroupDetailMessageComponent`, () => {
    let component: ChatGroupDetailMessageComponent;
    let fixture: ComponentFixture<ChatGroupDetailMessageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatGroupDetailMessageComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatGroupDetailMessageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
