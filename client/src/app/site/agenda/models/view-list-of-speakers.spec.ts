import { ListOfSpeakers } from 'app/shared/models/agenda/list-of-speakers';
import { Speaker } from 'app/shared/models/agenda/speaker';

import { UserListIndexType, ViewListOfSpeakers } from './view-list-of-speakers';
import { ViewSpeaker } from './view-speaker';

const LosSpeakers: ViewSpeaker[] = [
    new ViewSpeaker(
        new Speaker({
            id: 1,
            user_id: 1,
            weight: 4
        })
    ),
    new ViewSpeaker(
        new Speaker({
            id: 2,
            user_id: 2,
            weight: 3
        })
    ),
    new ViewSpeaker(
        new Speaker({
            id: 3,
            user_id: 3,
            weight: 2
        })
    ),
    new ViewSpeaker(
        new Speaker({
            id: 4,
            user_id: 4,
            weight: 1
        })
    ),
    new ViewSpeaker(
        new Speaker({
            id: 5,
            user_id: 5,
            begin_time: 100,
            end_time: 200
        })
    ),
    new ViewSpeaker(
        new Speaker({
            id: 6,
            user_id: 6,
            begin_time: 300
        })
    )
];

const LosData: any = {
    id: 1,
    closed: false,
    content_object_id: ``
};

describe(`ViewListOfSpeakers`, () => {
    let listOfSpeakers: ViewListOfSpeakers;

    beforeEach(() => {
        listOfSpeakers = new ViewListOfSpeakers(new ListOfSpeakers(LosData));
        listOfSpeakers.speakers = LosSpeakers;
    });

    it(`should find user 2 on los`, () => {
        expect(listOfSpeakers.isUserOnList(2)).toBeTrue();
    });

    it(`should not find user 42 on los`, () => {
        expect(listOfSpeakers.isUserOnList(42)).toBeFalse();
    });

    it(`should tell user 3 is at pos 2`, () => {
        expect(listOfSpeakers.findUserIndexOnList(3)).toBe(2);
    });

    it(`should tell that user 5 is finished`, () => {
        expect(listOfSpeakers.findUserIndexOnList(5)).toBe(UserListIndexType.Finished);
    });

    it(`should tell that user 6 is active`, () => {
        expect(listOfSpeakers.findUserIndexOnList(6)).toBe(UserListIndexType.Active);
    });

    it(`should find out that the active speaker is 6`, () => {
        const activeSpeaker = listOfSpeakers.activeSpeaker;
        expect(activeSpeaker.speaker.user_id).toBe(6);
    });

    it(`should tell that an unknown user is not in List`, () => {
        expect(listOfSpeakers.findUserIndexOnList(120)).toBe(UserListIndexType.NotOnList);
    });

    it(`should find one finished speaker`, () => {
        const finishedSpeaker = listOfSpeakers.finishedSpeakers;
        expect(finishedSpeaker.length).toBe(1);
    });

    it(`should count the waiting speakers`, () => {
        expect(listOfSpeakers.waitingSpeakerAmount).toBe(4);
    });
});
