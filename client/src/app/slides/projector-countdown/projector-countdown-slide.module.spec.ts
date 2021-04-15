import { ProjectorCountdownSlideModule } from './projector-countdown-slide.module';

describe('CountdownSlideModule', () => {
    let countdownSlideModule: ProjectorCountdownSlideModule;

    beforeEach(() => {
        countdownSlideModule = new ProjectorCountdownSlideModule();
    });

    it('should create an instance', () => {
        expect(countdownSlideModule).toBeTruthy();
    });
});
