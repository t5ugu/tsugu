import vscode = require('vscode');

const operateTable = JSON.parse('\
{\
    "table": [\
        {\
            "identifier": "*",\
            "order": 14,\
            "type": "op",\
            "arity": 2,\
            "assocLow": "L",\
            "fn": "(_l, _r) { return (typeof _l === \'number\' && typeof _r === \'number\')? _l * _r: `${_l} * ${_r}`; }",\
            "axiom": "scoreboard players operation arg[0] _ *= arg[1] _"\
        },\
        {\
            "identifier": "/",\
            "order": 14,\
            "type": "op",\
            "arity": 2,\
            "assocLow": "L",\
            "fn": "(_l, _r) { return (typeof _l === \'number\' && typeof _r === \'number\')? _l / _r: `${_l} / ${_r}`; }",\
            "axiom": "scoreboard players operation arg[0] _ /= arg[1] _"\
        },\
        {\
            "identifier": "%",\
            "order": 14,\
            "type": "op",\
            "arity": 2,\
            "assocLow": "L",\
            "fn": "(_l, _r) { return (typeof _l === \'number\' && typeof _r === \'number\')? _l % _r: `${_l} % ${_r}`; }",\
            "axiom": "scoreboard players operation arg[0] _ %= arg[1] _"\
        },\
        {\
            "identifier": "+",\
            "order": 13,\
            "type": "op",\
            "arity": 2,\
            "assocLow": "L",\
            "fn": "(_l, _r) { return (typeof _l === \'number\' && typeof _r === \'number\')? _l + _r: `${_l} + ${_r}`; }",\
            "axiom": "scoreboard players operation arg[0] _ += arg[1] _"\
        },\
        {\
            "identifier": "-",\
            "order": 13,\
            "type": "op",\
            "arity": 2,\
            "assocLow": "L",\
            "fn": "(_l, _r) { return (typeof _l === \'number\' && typeof _r === \'number\')? _l - _r: `${_l} - ${_r}`; }",\
            "axiom": "scoreboard players operation arg[0] _ -= arg[1] _"\
        },\
        {\
            "identifier": "=",\
            "order": 3,\
            "type": "op",\
            "arity": 2,\
            "assocLow": "R",\
            "fn": "(_l, _r) { return `${_l} = ${_r}`; }",\
            "axiom": "scoreboard players operation arg[0] _ = arg[1] _"\
        }\
    ],\
    "identifiers": [ "*", "/", "%", "+", "-", "=" ]\
}');

export async function scoreOperation() {
    const editor = vscode.window.activeTextEditor!;
    let text = editor.document.getText(editor.selection);

    const table: {
        identifier: string;
        order: number;
        type: string;
        arity: number;
        assocLow: string;
        fn: Function;
        axiom: string;
    }[] = [];
    for (let i = 0; i < operateTable.table.length; i++) {
        table.push({
            identifier: operateTable.table[i].identifier,
            order: operateTable.table[i].order,
            type: operateTable.table[i].type,
            arity: operateTable.table[i].arity,
            assocLow: operateTable.table[i].assocLow,
            fn: new Function("return function " + operateTable.table[i].fn)(),
            axiom: operateTable.table[i].axiom
        });
    }

    function rpnGenerate(exp: string) {
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
                if (exp.indexOf(table[key].identifier) === 0) {
                    op = table[key].identifier;
                    exp = exp.substring(table[key].identifier.length);
                    break;
                }
            }
    
            if (op === null) {
                g = exp.match(/^([a-z]+)/i);
                if (g !== null) {
                    polish.push(g[0]);
                    exp = exp.substring(g[0].length);
                    unary = false;
                    continue;
                }
                throw new Error("illegal expression:" + exp.substring(0, 10) + " ...");
            }
    
            ///スタック構築
            ///・各演算子の優先順位
            ///・符合の単項演算子化
            switch (op) {
                default:
                    ///+符号を#に、-符号を_に置換
                    if (unary) {
                        if (op === '+') { op = '#'; }
                        else if (op === '-') { op = '_'; }
                    }
    
                    //演算子スタックの先頭に格納
                    //・演算子がまだスタックにない
                    //・演算子スタックの先頭にある演算子より優先度が高い
                    //・演算子スタックの先頭にある演算子と優先度が同じでかつ結合法則がright to left
                    if (opeStack[depth].length === 0 ||
                        table[ssft(op)].order > table[ssft(opeStack[depth][0])].order ||
                        (table[ssft(op)].order === table[ssft(opeStack[depth][0])].order && table[ssft(op)].assocLow === "R")
                    ) {
                        opeStack[depth].unshift(op);
                    } else {
                        //式のスタックに演算子を積む
                        //演算子スタックの先頭から、優先順位が同じか高いものを全て抽出して式に積む
                        //※優先順位が同じなのは結合法則がright to leftのものだけスタックに積んである
                        //演算優先度が、スタック先頭の演算子以上ならば、続けて式に演算子を積む
                        while (opeStack[depth].length > 0) {
                            var ope = opeStack[depth].shift();
                            polish.push(ope);
                            if (table[ssft(ope)].order < table[ssft(op)].order) { break; }
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
    
        return "";
    };

    function ssft(_str: string) { return operateTable.identifiers.indexOf(_str); }; // Search String From (operation) operateTable

    let formula: string;
    if (!text) {
        let res = await vscode.window.showInputBox({ value: '' });
        text = res!;
        if (res !== '') {
            formula = rpnGenerate(res!);
        } else {
            vscode.window.showErrorMessage('Formula NOT SELECTED');
            return;
        }
    } else {
        formula = rpnGenerate(text);
    }

    function fnSplitOperator(_val: string) {
        if (_val === "") { return; }

        if (ssft(_val) !== -1 && isNaN(Number(_val.toString()))) {
            rpnStack.push({
                value: _val,
                type: table[ssft(_val)].type
            });
            return;
        }

        for (let i = 0; i < operateTable.identifiers.length; i++) {
            var piv = _val.indexOf(table[i].identifier);
            if (piv !== -1) {
                fnSplitOperator(_val.substring(0, piv));
                fnSplitOperator(_val.substring(piv, piv + operateTable.identifiers[i].length));
                fnSplitOperator(_val.substring(piv + operateTable.identifiers[i].length));
                return;
            }
        }

        if (!isNaN(parseFloat(_val))) {
            rpnStack.push({ value: _val, type: "num" });
        }
        else {
            rpnStack.push({ value: _val, type: "str" });
        }
    };

    var rpnStack: { value: string, type: string }[] = [];
    var rpnArray = formula.split(/\s+|,/);
    for (var i = 0; i < rpnArray.length; i++) {
        fnSplitOperator(rpnArray[i]);
    }

    var calcStack: (number | string)[] = [];
    let resValues = '';
    let resFormulas = '';
    while (rpnStack.length > 0) {
        var elem = rpnStack.shift()!;
        switch (elem.type) {
            case "num":
                let put = elem.value.indexOf("0x") !== -1 ? parseInt(elem.value, 16) : parseFloat(elem.value);
                calcStack.push(put);
                resValues += `scoreboard players set $CMDUTIL_${elem.value} _ ${put}\n`;
                break;

            case "str":
                calcStack.push(elem.value);
                break;

            case "op": case "fn":
                var operate = table[ssft(elem.value)];

                let str = operate.axiom!;
                for (var i = 1; i >= 0; i--) {
                    if (str.indexOf(`arg[${i}]`) !== -1) {
                        let t = `$CMDUTIL_${calcStack.pop()!.toString()}`;
                        str = str.substring(0, str.indexOf(`arg[${i}]`)) + t
                            + str.substring(str.indexOf(`arg[${i}]`) + `arg[${i}]`.length);

                        if (i === 0) { calcStack.push(t.slice('$CMDUTIL_'.length)); }
                    }
                }

                resFormulas += `${str}\n`;
                break;
        }
    }

    editor.edit(edit => {
        edit.replace(editor.selection, [
            `# ${text}`,
            '#if u wish, u can change both <Holder>s\' NAME and the OBJECT _',
            '',
            resValues,
            resFormulas
        ].join('\n'));
    });
}