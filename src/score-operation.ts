// Array.slice(-1)[0] <-> Array[-1]

/*
todo;

input-;

a=f(a,b)

output-;

result: f[1]
[1]: [1-1], [1-2]
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
        let p: number[][] = [];  // 始点と終点のペア
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
                    p.push([_s, i]);
                    spled.push(formulas[1].slice(_s + 1, i));
                    still.pop();

                    let _t = gle(spled) + '';

                    let _t_ = '';
                    if (_t.indexOf(',') !== -1) {
                        func.push(_t.split(','));
                        for (let j = 0; j < gle(func).length; j++) {
                            _t_ += `[${j}],`;
                        }
                        _t_ = `${_t_.substring(0, _t_.length - 1)}`;
                    }
                    else { func.push([]); }

                    _t = `(${_t})`;
                    let _i = formulas[1].indexOf(_t);
                    while (_i !== -1) {
                        formulas[1] = formulas[1].substring(0, _i) + `[${spled.length}]` +
                            formulas[1].substring(_i + _t.length, formulas[1].length);
                        _i = formulas[1].indexOf(_t);
                    }

                    if (_t.length > 1) { i -= _t.length - 1; }

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