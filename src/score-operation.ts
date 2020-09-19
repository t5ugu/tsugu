import vscode = require('vscode');
import rpn = require('./rpn/rpn');

export function scoreOperation() {
    function gle(arr: any[]) { return arr.slice(-1)[0]; }   // Get Last Element

    const editor = vscode.window.activeTextEditor;
    const doc = editor!.document;
    const selection = editor!.selection;

    let text = doc.getText(selection);
    let formula = rpn.rpnGenerate(text)!;

    vscode.window.showInformationMessage(formula);
    if (formula !== null) {
        vscode.window.showInformationMessage(rpn.rpnCalculation(formula)!.toString());
    }
}