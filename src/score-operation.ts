import * as vscode from 'vscode';

export function scoreOperation() {
    let editor = vscode.window.activeTextEditor;
    let doc = editor?.document;

    let select = editor?.selection;

    let text = doc?.getText(select).replace(' ', '');
    let formulas = text?.split('=');
    //let formulasCpy = formulas;

    if (formulas !== undefined && formulas[0].length !== 0 && formulas[1].length !== 0) {
        let pair: number[][] = [];
        let still: number[] = [];
        let spled: string[] = [];

        for (let j = 0; formulas[1].indexOf('(') !== -1; j++) {
            for (let i = 0; i < formulas[1].length; i++) {
                switch (formulas[1].charAt(i)) {
                    case '(':
                        still.push(i);
                        continue;
                    case ')':
                        pair.push([still.slice(-1)[0], i]);
                        spled.push(formulas[1].slice(still.slice(-1)[0] + 1, i));

                        formulas[1] = formulas[1].replace(`(${spled.slice(-1)[0]})`, `[${spled.length}]`);

                        still.pop();
                        continue;
                    default:
                        continue;
                }
            }
        }

        let elements: (string | number)[][] = [];

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