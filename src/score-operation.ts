// Array.slice(-1)[0] <-> Array[-1]

import * as vscode from 'vscode';

export function scoreOperation() {
    let editor = vscode.window.activeTextEditor;
    let doc = editor?.document;

    let select = editor?.selection;

    let text = doc?.getText(select).replace(' ', '');
    let formulas = text!.split('=');

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
                    p.push([still.slice(-1)[0], i]);
                    spled.push(formulas[1].slice(still.slice(-1)[0] + 1, i));
                    still.pop();

                    let _t = `(${spled.slice(-1)[0]})`;
                    let _i = formulas[1].indexOf(_t);

                    if(_t.indexOf(',')!==-1) {
                        func.push(_t.split(','));

                        while (_i !== -1) {
                            formulas[1] = formulas[1].substring(0, _i) +
                                `[${spled.length}:]` +
                                formulas[1].substring(_i + _t.length, formulas[1].length);
                            _i = formulas[1].indexOf(_t);
                        }
                    }
                    else {
                        func.push([]);
                        
                        while (_i !== -1) {
                            formulas[1] = formulas[1].substring(0, _i) +
                            `[${spled.length}]` +
                            formulas[1].substring(_i + _t.length, formulas[1].length);
                            _i = formulas[1].indexOf(_t);
                        }
                        
                        if (_t.length > 1) { i -= _t.length - 1; }
                    }
                    continue;

                default:
                    continue;
            }
        }

        //let elements: (string | number)[][] = [];

        // TODO

        vscode.window.showInformationMessage('result: ' + formulas[1]);
        for (let i = 0; i < spled.length; i++) {
            vscode.window.showInformationMessage(`[${i + 1}]: ` + spled[i]);
        }
    }
    else {
        vscode.window.showErrorMessage('Your Formula is Deficient!');
    }
}