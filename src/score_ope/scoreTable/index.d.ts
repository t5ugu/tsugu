export interface ScoreElement {
    identifier: string;
    order: number;
    type: string;
    axiom: string;
}

export interface ScoreTable {
    table: Array<ScoreElement>
    identifiers: Array<string>
}