import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AssignmentDetailComponent} from './assignment-detail.component';

import {ViewAssignmentCandidate} from "../../../../view-models";

xdescribe(`AssignmentDetailComponent`, () => {
    let component: AssignmentDetailComponent;
    let fixture: ComponentFixture<AssignmentDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AssignmentDetailComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AssignmentDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });

    describe('candidate sorting', () => {
        let candidates: ViewAssignmentCandidate[];
        let onSortingChangeSpy: jasmine.Spy;

        beforeEach(() => {
            candidates = [
                {user: {first_name: 'Karl', last_name: 'Marx'}, id: 1} as ViewAssignmentCandidate,
                {user: {first_name: 'Rosa', last_name: 'Luxemburg'}, id: 2} as ViewAssignmentCandidate,
                {user: {first_name: 'Kurt', last_name: 'Eisner'}, id: 3} as ViewAssignmentCandidate,
                {user: {first_name: 'Clara', last_name: 'Zetkin'}, id: 4} as ViewAssignmentCandidate
            ];
            (component as any)._assignmentCandidates = candidates;
            onSortingChangeSpy = spyOn(component, 'onSortingChange').and.returnValue(Promise.resolve());
        });

        it('should sort candidates by first name', async () => {
            await component.sortCandidatesByFirstName();
            const sortedCandidates = onSortingChangeSpy.calls.mostRecent().args[0];
            expect(sortedCandidates.map((c: ViewAssignmentCandidate) => c.user.first_name)).toEqual(['Clara', 'Karl', 'Karl', 'Kurt', 'Rosa']);
            expect(sortedCandidates.map((c: ViewAssignmentCandidate) => c.user.last_name)).toEqual(['Zetkin', 'Liebknecht', 'Marx', 'Eisner', 'Luxemburg']);
        });

        it('should sort candidates by last name', async () => {
            await component.sortCandidatesByLastName();
            const sortedCandidates = onSortingChangeSpy.calls.mostRecent().args[0];
            expect(sortedCandidates.map((c: ViewAssignmentCandidate) => c.user.last_name)).toEqual(['Eisner', 'Liebknecht', 'Luxemburg', 'Marx', 'Zetkin']);
            expect(sortedCandidates.map((c: ViewAssignmentCandidate) => c.user.first_name)).toEqual(['Kurt', 'Karl', 'Rosa', 'Karl', 'Clara']);
        });
    });
});
