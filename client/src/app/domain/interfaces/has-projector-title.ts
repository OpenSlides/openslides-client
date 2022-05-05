import { Projection } from '../models/projector/projection';

export interface ProjectorTitle {
    title: string;
    subtitle?: string;
}

export interface HasProjectorTitle {
    getProjectorTitle: (projection: Projection) => ProjectorTitle;
}
