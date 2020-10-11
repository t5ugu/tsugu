export interface IOperateElement {
    identifier: string;
    order: number;
    type: string;
    arity: number;
    assocLow: string;
    fn: Function;
}

export interface IOperateTable {
    table: Array<IOperateElement>;
    identifiers: Array<string>;
}