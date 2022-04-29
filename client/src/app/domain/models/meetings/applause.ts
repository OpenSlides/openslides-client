export interface Applause {
    level: number;
    presentUsers: number;
}

export enum ApplauseType {
    particles = `applause-type-particles`,
    bar = `applause-type-bar`
}
