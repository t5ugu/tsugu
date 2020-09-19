export default interface IIndexable {
    [key: string]: {
        order: number, type: string, arity: number, assocLow: string,
        fn: Function
    };
}