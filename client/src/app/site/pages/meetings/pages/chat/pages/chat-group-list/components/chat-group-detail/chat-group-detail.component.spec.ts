import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatGroupDetailComponent } from './chat-group-detail.component';

xdescribe(`ChatGroupDetailComponent`, () => {
    let component: ChatGroupDetailComponent;
    let fixture: ComponentFixture<ChatGroupDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatGroupDetailComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatGroupDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
