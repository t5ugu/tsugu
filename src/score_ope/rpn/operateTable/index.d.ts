export interface IIdentifiers {
    identifier: string;
    order: number;
    type: string;
    arity: number;
    assocLow: string;
    fn: string | Function;
    comment?: string;
}

export interface IJsonOperateTable {
    table: Array<IIdentifiers>;
    identifiers: Array<string>;
}