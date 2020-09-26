export interface IIdentifiers {
    identifier: string;
    order: number;
    type: string;
    arity: number;
    assocLow: string;
    fn: Function;
}

export interface IJsonOperateTable {
    table: Array<IIdentifiers>;
    identifiers: Array<string>;
}