// https://github.com/spica-git/ReversePolishNotation/ からコピー、微改変

import * as IOpe from "./operateTable/index";
import opTable from './operateTable/operateTable.json';

/**
 * @description 演算子・その他演算機能の定義
 * 	order: 演算の優先順位（MDNの定義に準拠）
 * 		https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
 * 	arity: 演算項の数
 *	assocLow: 結合法則（"":なし, "L":左結合(left to right), "R":右結合(right to left)）
 * 	fn: 演算処理
 */
var table: IOpe.IIdentifiers[] = opTable.table;

/*
//+符合の代替
    '#': {
        order: 16, type: "op", arity: 1, assocLow: "R",
        fn: function (_l: number) { return _l; }
    },
    '+': {
        order: 13, type: "op", arity: 2, assocLow: "L",
        fn: function (_l: number, _r: number) { return _l + _r; }
    },
    '(': {
        order: 20, type: "state", arity: 0, assocLow: "",
        fn: function () { }
    },
    ')': {
        order: 20, type: "state", arity: 0, assocLow: "",
        fn: function () { }
    },
    //-符合の代替
    '_': {
        order: 16, type: "op", arity: 1, assocLow: "R",
        fn: function (_l: number) { return -_l; }
    },
    '~': {
        order: 16, type: "op", arity: 1, assocLow: "R",
        fn: function (_l: number) { return ~_l; }
    },
    '**': {
        order: 15, type: "op", arity: 2, assocLow: "R",
        fn: function (_l: number, _r: number) { return _l ** _r; }
    },
    '*': {
        order: 14, type: "op", arity: 2, assocLow: "L",
        fn: function (_l: number, _r: number) { return _l * _r; }
    },
    '/': {
        order: 14, type: "op", arity: 2, assocLow: "L",
        fn: function (_l: number, _r: number) { return _l / _r; }
    },
    '%': {
        order: 14, type: "op", arity: 2, assocLow: "L",
        fn: function (_l: number, _r: number) { return _l % _r; }
    },
    '-': {
        order: 13, type: "op", arity: 2, assocLow: "L",
        fn: function (_l: number, _r: number) { return _l - _r; }
    },
    '<<': {
        order: 12, type: "op", arity: 2, assocLow: "L",
        fn: function (_l: number, _r: number) { return _l << _r; }
    },
    '>>': {
        order: 12, type: "op", arity: 2, assocLow: "L",
        fn: function (_l: number, _r: number) { return _l >> _r; }
    },
    '&': {
        order: 9, type: "op", arity: 2, assocLow: "L",
        fn: function (_l: number, _r: number) { return _l & _r; }
    },
    '^': {
        order: 8, type: "op", arity: 2, assocLow: "L",
        fn: function (_l: number, _r: number) { return _l ^ _r; }
    },
    '|': {
        order: 7, type: "op", arity: 2, assocLow: "L",
        fn: function (_l: number, _r: number) { return _l | _r; }
    }*/

/**
 * Search String From operation Table
 */
function ssft(_str: string) {
    return table[opTable.identifiers.indexOf(_str)];
};

/**
 * @description 逆ポーランド記法の式を計算する
 * @param {string} rpnExp 計算式
 */
export function rpnCalculation(rpnExp: string) {
    ///引数エラー判定
    if (rpnExp === null || typeof rpnExp !== 'string') { throw new Error("illegal arg type"); }

    //演算子と演算項を切り分けて配列化する。再起するので関数化。
    function fnSplitOperator(_val: string) {
        if (_val === "") { return; }

        //演算子判定
        if (_val in opTable.identifiers && isNaN(Number(_val.toString()))) {
            rpnStack.push({ value: _val,
                type: ssft(_val).type});
            return;
        }

        //演算子を含む文字列かどうか判定
        for (var op in table) {
            var piv = _val.indexOf(op);
            if (piv !== -1) {
                fnSplitOperator(_val.substring(0, piv));
                fnSplitOperator(_val.substring(piv, piv + op.length));
                fnSplitOperator(_val.substring(piv + op.length));
                return;
            }
        }

        //数値
        if (!isNaN(parseFloat(_val))) {
            rpnStack.push({ value: _val, type: "num" });
        }
        //文字列
        else {
            rpnStack.push({ value: _val, type: "str" });
        }
    };

    for (const i in table) {
        table[i].fn = Function("return " + table[i].fn)();
    }

    //切り分け実行
    //式を空白文字かカンマでセパレートして配列化＆これらデリミタを式から消す副作用
    var rpnStack: { value: string, type: string }[] = [];
    for (var i = 0, rpnArray = rpnExp.split(/\s+|,/); i < rpnArray.length; i++) {
        fnSplitOperator(rpnArray[i]);
    }

    ///演算開始
    var calcStack: (number | string)[] = []; //演算結果スタック
    while (rpnStack.length > 0) {
        var elem = rpnStack.shift();
        if (elem === undefined) { elem = { type: "str", value: "" }; }
        switch (elem.type) {
            //演算項（数値のparse）
            case "num":
                calcStack.push(
                    elem.value.indexOf("0x") !== -1 ? parseInt(elem.value, 16) : parseFloat(elem.value)
                );
                break;

            //演算項（文字列）※数値以外のリテラルを扱うような機能は未サポート
            case "str":
                calcStack.push(elem.value);
                break;

            //制御文 ※計算時にはないはずなのでwarningを出して無視
            case "state":
                console.warn("inclute statement:" + elem.value);
                break;

            //演算子・計算機能
            case "op": case "fn":
                var operate = ssft(elem.value);
                if (operate === null) { throw new Error("not exist operate:" + elem.value); }
                if (typeof operate.fn === 'string') { continue; }

                //演算に必要な数だけ演算項を抽出
                var args = [];
                for (var i = 0; i < operate.arity; i++) {
                    if (calcStack.length > 0) {
                        args.unshift(calcStack.pop());
                    }
                    else {
                        throw new Error("not enough operand");
                    }
                }

                //演算を実行して結果をスタックへ戻す
                var res: any = operate.fn.apply(null, args);
                if (res !== null) { calcStack.push(res); }
                break;
        }
    }

    ///途中失敗の判定
    if (rpnStack.length > 0 || calcStack.length !== 1) {
        console.warn({ message: "calculate unfinished", restRpn: rpnStack, resultValue: calcStack });
        return null;
    }

    ///計算結果を戻す
    return calcStack[0];
}


/**
 * @description 計算式から逆ポーランド記法を生成
 * @param {string} exp 計算式
 */
export function rpnGenerate(exp: string) {
    var polish = []; ///parse結果格納用
    var opeStack: any[][] = [[]]; ///演算子スタック
    var depth = 0; ///括弧のネスト深度
    var unary = true; //単項演算子チェック（正負符号等）

    do {
        //先頭の空白文字とカンマを消去
        exp = exp.replace(/^(\s|,)+/, "");
        if (exp.length === 0) { break; }

        //演算子スタック
        opeStack[depth] = opeStack[depth] || [];

        ///数値抽出（整数・小数・16進数）
        var g = exp.match(/(^0x[0-9a-f]+)|(^[0-9]+(\.[0-9]+)?)/i);
        if (g !== null) {
            polish.push(g[0].indexOf("0x") === 0 ? parseInt(g[0], 16) : parseFloat(g[0]));
            exp = exp.substring(g[0].length);
            unary = false;
            continue;
        }

        //演算子抽出
        var op = null;
        for (var key in table) {
            if (exp.indexOf(key) === 0) {
                op = key;
                exp = exp.substring(key.length);
                break;
            }
        }

        if (op === null) {
            throw new Error("illegal expression:" + exp.substring(0, 10) + " ...");
        }

        ///スタック構築
        ///・各演算子の優先順位
        ///・符合の単項演算子化
        switch (op) {
            default:
                ///+符号を#に、-符号を_に置換
                if (unary) {
                    if (op === "+") { op = "#"; }
                    else if (op === "-") { op = "_"; }
                }

                //演算子スタックの先頭に格納
                //・演算子がまだスタックにない
                //・演算子スタックの先頭にある演算子より優先度が高い
                //・演算子スタックの先頭にある演算子と優先度が同じでかつ結合法則がright to left
                if (opeStack[depth].length === 0 ||
                    ssft(op).order > table[opeStack[depth][0]].order ||
                    (ssft(op).order === table[opeStack[depth][0]].order
                        && ssft(op).assocLow === "R")
                ) {
                    opeStack[depth].unshift(op);
                }
                //式のスタックに演算子を積む
                else {
                    //演算子スタックの先頭から、優先順位が同じか高いものを全て抽出して式に積む
                    //※優先順位が同じなのは結合法則がright to leftのものだけスタックに積んである
                    while (opeStack[depth].length > 0) {
                        var ope = opeStack[depth].shift();
                        polish.push(ope);
                        //演算優先度が、スタック先頭の演算子以上ならば、続けて式に演算子を積む
                        if (table[ope].order >= ssft(op).order) {
                            continue;
                        }
                        else {
                            break;
                        }
                    }
                    opeStack[depth].unshift(op);
                }
                unary = true;
                break;

            //括弧はネストにするので特別
            case "(":
                depth++;
                unary = true;
                break;

            case ")":
                while (opeStack[depth].length > 0) { ///演算子スタックを全て処理
                    polish.push(opeStack[depth].shift());
                }
                if (--depth < 0) {
                    //括弧閉じ多すぎてエラー
                    throw new Error("too much ')'");
                }
                unary = false; ///括弧を閉じた直後は符号（単項演算子）ではない
                break;
        }
    } while (exp.length > 0);

    if (depth > 0) {
        console.warn({ message: "too much '('", restExp: exp });
    }
    else if (exp.length > 0) {
        console.warn({ message: "generate unifinished", restExp: exp });
    }
    else {
        while (opeStack[depth].length > 0) {
            polish.push(opeStack[depth].shift());
        }
        return polish.join(" ");
    }

    return null;
};


/**
 * @description デフォルトサポートの演算子以外の機能追加（差し替え）
 * @param {string} _name Operator name
 * @param {number} _order
 * @param {string} _type
 * @param {number} _arity Argument num (Operand num)
 * @param {string} _assocLow
 * @param {Object} _fn Operator Function
 */
export function rpnSetOperate(_name: string, _order: number, _type: string, _arity: number, _assocLow: string, _fn: Function) {
    //ssft(_name) = { order: _order, type: _type, arity: _arity, assocLow: _assocLow, fn: _fn, comment: "" };
};