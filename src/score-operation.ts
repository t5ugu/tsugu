// Array.slice(-1)[0] <-> Array[-1]

/*
todo;

input-;

a=f(a,b)

output-;

result: f[1]
[1-0]: [1-1], [1-2]
[1-1]: a
[1-2]: b
*/

import * as vscode from 'vscode';

export function scoreOperation() {
    function gle(arr: any[]) { return arr.slice(-1)[0]; }   // Get Last Element

    let editor = vscode.window.activeTextEditor;
    let doc = editor?.document;

    let select = editor?.selection;

    let formulas = (doc?.getText(select).replace(' ', '') + '').split('=');

    if (formulas[0].length !== 0 && formulas[1].length !== 0) {
        let still: number[] = [];   // 始点のみ
        let spled: string[] = [];   // p内のペアの文字
        let func: string[][] = [];  // 関数

        for (let i = 0; i < formulas[1].length; i++) {
            switch (formulas[1].charAt(i)) {
                case '(':
                    still.push(i);
                    continue;

                case ')':
                    let _s = gle(still);
                    spled.push(formulas[1].slice(_s + 1, i));
                    still.pop();

                    let _t = gle(spled) + '';

                    func.push(_t.split(','));

                    _t = `(${_t})`;
                    let k = formulas[1].indexOf(_t);
                    for (let j = 0; j < gle(func).length; j++) {
                        while (k !== -1) {
                            formulas[1] = formulas[1].substring(0, k) + `[${spled.length}-${j}]` +
                                formulas[1].substring(k + _t.length, formulas[1].length);
                            k = formulas[1].indexOf(_t);
                        }
                    }

                    let v = spled.length.toString().length; // 1, 2...
                    let w = _t.length;                      // (a)
                    if (w > v) { i = i - w - v; } else
                    
                    // (abc)
                    //     ^  <- index is 5
                    // -- to be...
                    // [1]
                    //   ^    <- index is 3
                    
                    if (w < v) { i = i - w + v; }

                    continue;

                default:
                    continue;
            }
        }

        vscode.window.showInformationMessage(`result: ${formulas[1]}`);
        for (let i = 0; i < spled.length; i++) {
            vscode.window.showInformationMessage(`[${i + 1}]: ${spled[i]}`);
            if (func[i] !== []) {
                for (let j = 0; j < func[i].length; j++) {
                    vscode.window.showInformationMessage(`[${i + 1}]: [${j + 1}]: ${func[i][j]}`);
                }
            }
        }
    }
    else {
        vscode.window.showErrorMessage('Your Formula is Deficient!');
    }
}