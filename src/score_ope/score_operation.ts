import vscode = require('vscode');
import rpn = require('./rpn/rpn');
import IOpe from './rpn/operateTable/index';
import opTable from './rpn/operateTable/operateTable.json';

export function scoreOperation() {
    const table: IOpe.IIdentifierWithSBCalcs[] = [];
    for (let i = 0; i < opTable.table.length; i++) {
        let t = opTable.table[i];
        table.push({
            identifier: t.identifier,
            order: t.order,
            type: t.type,
            arity: t.arity,
            assocLow: t.assocLow,
            fn: new Function("return " + t.fn)(),
            axiom: t.axiom
        });
    }

    function gle(arr: any[]) { return arr.slice(-1)[0]; }   // Get Last Element
    function ssft(_str: string) { return opTable.identifiers.indexOf(_str); };


    const editor = vscode.window.activeTextEditor!;
    const doc = editor.document;
    const selection = editor.selection;

    let text = doc.getText(selection);

    let formula = rpn.rpnGenerate(text);

    //vscode.window.showInformationMessage(rpn.rpnCalculation(formula)!.toString());

    function fnSplitOperator(_val: string) {
        if (_val === "") { return; }

        if (ssft(_val) !== -1 && isNaN(Number(_val.toString()))) {
            rpnStack.push({
                value: _val,
                type: table[ssft(_val)].type
            });
            return;
        }

        for (let i = 0; i < opTable.identifiers.length; i++) {
            var piv = _val.indexOf(table[i].identifier);
            if (piv !== -1) {
                fnSplitOperator(_val.substring(0, piv));
                fnSplitOperator(_val.substring(piv, piv + opTable.identifiers[i].length));
                fnSplitOperator(_val.substring(piv + opTable.identifiers[i].length));
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
    let response: string = `# ${text}\n# scoreboard objectives add _ dummy\n#if you wish, you can erase $\n`;
    while (rpnStack.length > 0) {
        var elem = rpnStack.shift()!;
        switch (elem.type) {
            case "num":
                calcStack.push(
                    elem.value.indexOf("0x") !== -1 ? parseInt(elem.value, 16) : parseFloat(elem.value)
                );
                response += `scoreboard players set $${gle(calcStack)} _ ${gle(calcStack)}\n`;
                break;

            case "str":
                calcStack.push(elem.value);
                break;

            case "op": case "fn":
                var operate = table[ssft(elem.value)];

                let str = operate.axiom!;
                for (var i = operate.arity - 1; i >= 0; i--) {
                    if (str.indexOf(`arg[${i}]`) !== -1) {
                        let t = `$${calcStack.pop()!.toString()}`;
                        str = str.substring(0, str.indexOf(`arg[${i}]`)) + t
                            + str.substring(str.indexOf(`arg[${i}]`) + `arg[${i}]`.length);

                        if (i === 0) { calcStack.push(t.substring(1));}
                    }
                }

                response += `${str}\n`;
                break;
        }
    }

    editor.edit(edit => {
        edit.replace(selection, response.substring(0, response.length - 1));
    });
}