export interface IScoreElement {
    identifier: string;
    order: number;
    type: string;
    axiom: string;
}

export interface IScoreTable {
    table: Array<IScoreElement>
    identifiers: Array<string>
}