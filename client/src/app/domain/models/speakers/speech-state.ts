export enum SpeechState {
    PRO = `pro`,
    CONTRA = `contra`,
    CONTRIBUTION = `contribution`,
    INTERPOSED_QUESTION = `interposed_question`,
    INTERVENTION = `intervention`
}

export const SPECIAL_SPEECH_STATES = [SpeechState.INTERPOSED_QUESTION, SpeechState.INTERVENTION];
