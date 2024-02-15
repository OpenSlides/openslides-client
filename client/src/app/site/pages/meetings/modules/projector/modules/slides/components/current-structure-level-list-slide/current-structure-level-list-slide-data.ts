export interface CurrentStructureLevelListSlideStructureLevelRepresentation {
    name: string;
    color: string;
    remaining_time: number;
    current_start_time: number;
}

export interface CurrentStructureLevelListSlideData {
    title: string;
    structure_levels: CurrentStructureLevelListSlideStructureLevelRepresentation[];
}
