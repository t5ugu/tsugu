import vscode = require('vscode');
import rpn = require('./rpn/rpn');
import scoreTable from './scoreTable/index.json';

export async function scoreOperation() {
    const editor = vscode.window.activeTextEditor!;
    let text = editor.document.getText(editor.selection);

    const table: {
        identifier: string;
        order: number;
        type: string;
        axiom: string;
    }[] = [];
    for (let i = 0; i < scoreTable.table.length; i++) {
        let t = scoreTable.table[i];
        table.push({
            identifier: t.identifier,
            order: t.order,
            type: t.type,
            axiom: t.axiom
        });
    }

    function ssft(_str: string) { return scoreTable.identifiers.indexOf(_str); }; // Search String From (operation) Table

    let formula: string;
    if (!text) {
        let res = await vscode.window.showInputBox({ value: '' });
        text = res!;
        if (res !== '') {
            formula = rpn.rpnGenerate(res!);
        } else {
            vscode.window.showErrorMessage('Formula NOT SELECTED');
            return;
        }
    } else {
        formula = rpn.rpnGenerate(text);
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