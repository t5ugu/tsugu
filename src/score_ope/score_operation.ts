import vscode = require('vscode');
import rpn = require('./rpn/rpn');
import IScoreTable from './scoreTable/index';
import scoreTable from './scoreTable/index.json';
import C = require('./claculation');

export function scoreOperation() {
    const editor = vscode.window.activeTextEditor!;
    const doc = editor.document;
    const selection = editor.selection;

    let text = doc.getText(selection);

    vscode.window.showInformationMessage(new C.Div().div('(x - 1)', 'x + 1').toString());

    const table: IScoreTable.ScoreElement[] = [];
    for (let i = 0; i < scoreTable.table.length; i++) {
        let t = scoreTable.table[i];
        table.push({
            identifier: t.identifier,
            order: t.order,
            type: t.type,
            axiom: t.axiom
        });
    }

    function gle(arr: any[]) { return arr.slice(-1)[0]; }   // Get Last Element
    function ssft(_str: string) { return scoreTable.identifiers.indexOf(_str); }; // Search String From (operation) Table

    let formula = rpn.rpnGenerate(rpn.rpnCalculation(rpn.rpnGenerate(text)).toString());

    function fnSplitOperator(_val: string) {
        if (_val === "") { return; }

        if (ssft(_val) !== -1 && isNaN(Number(_val.toString()))) {
            rpnStack.push({
                value: _val,
                type: table[ssft(_val)].type
            });
            return;
        }

        for (let i = 0; i < scoreTable.identifiers.length; i++) {
            var piv = _val.indexOf(table[i].identifier);
            if (piv !== -1) {
                fnSplitOperator(_val.substring(0, piv));
                fnSplitOperator(_val.substring(piv, piv + scoreTable.identifiers[i].length));
                fnSplitOperator(_val.substring(piv + scoreTable.identifiers[i].length));
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
    let response = `# ${text}\n# scoreboard objectives add _ dummy\n#if U wish, U can change $\n`;
    let resValues = '';
    let resFormulas = '';
    while (rpnStack.length > 0) {
        var elem = rpnStack.shift()!;
        switch (elem.type) {
            case "num":
                calcStack.push(
                    elem.value.indexOf("0x") !== -1 ? parseInt(elem.value, 16) : parseFloat(elem.value)
                );
                resValues += `scoreboard players set $${elem.value} _ ${gle(calcStack)}\n`;
                break;

            case "str":
                calcStack.push(elem.value);
                break;

            case "op": case "fn":
                var operate = table[ssft(elem.value)];

                let str = operate.axiom!;
                for (var i = 1; i >= 0; i--) {
                    if (str.indexOf(`arg[${i}]`) !== -1) {
                        let t = `$${calcStack.pop()!.toString()}`;
                        str = str.substring(0, str.indexOf(`arg[${i}]`)) + t
                            + str.substring(str.indexOf(`arg[${i}]`) + `arg[${i}]`.length);

                        if (i === 0) { calcStack.push(t.substring(1)); }
                    }
                }

                resFormulas += `${str}\n`;
                break;
        }
    }
    response += resValues + resFormulas;

    editor.edit(edit => {
        edit.replace(selection, response);
    });
}