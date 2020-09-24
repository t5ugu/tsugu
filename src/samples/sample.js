// https://github.com/oOBoomberOo/mc-math-generator/

const errorMessage = {
    'invalid': 'Invalid Expression',
    'operator': {
        '^': {
            'ontInteger': 'String after "^" operator have to be integer',
            'tooBig': 'Exponent is too big'
        }
    }
};

exports.mathExpression = function (expression, scoreboard, settings, callback) {
    let template = {
        normal: {
            '+': ['scoreboard players add <selector> <scoreboard> <value>'],
            '-': ['scoreboard players remove <selector> <scoreboard> <value>']
        },
        operation: {
            '+': ['scoreboard players operation <selector1> <scoreboard1> += <selector2> <scoreboard2>'],
            '-': ['scoreboard players operation <selector1> <scoreboard1> -= <selector2> <scoreboard2>'],
            '*': ['scoreboard players operation <selector1> <scoreboard1> *= <selector2> <scoreboard2>'],
            '/': ['scoreboard players operation <selector1> <scoreboard1> /= <selector2> <scoreboard2>'],
            '%': ['scoreboard players operation <selector1> <scoreboard1> %= <selector2> <scoreboard2>']
        },
        special: {
            '^': [
                'scoreboard players operation <selector1> <scoreboard2> = <selector1> <scoreboard1>',
                'scoreboard players operation <selector1> <scoreboard1> *= <selector1> <scoreboard2>'
            ]
        }
    };
    scoreboard = scoreboard === false ? [settings['scoreboard1'], settings['scoreboard2']] : scoreboard.replace(/\s/g, '').split(',');
    scoreboard = scoreboard.length === 1 ? [scoreboard[0], scoreboard[0]] : scoreboard;
    scoreboard = scoreboard.length > 2 ? [scoreboard[0], scoreboard[1]] : scoreboard;

    expression = assertEquation(expression);
    let variable = expression[0];
    let operator = expression[1];
    let mainSelector = variable[0];
    let result = [];
    if (variable.length >= 1) {
        variable = variable.slice(1, variable.length);
        if (variable.length <= operator.length) {
            for (let i = 0; i < variable.length; i++) {
                let currentVariable = variable[i];
                let currentOperator = operator[i];

                let currentOperation = determineOperator(currentOperator, currentVariable);
                if (template[currentOperation.type] && template[currentOperation.type][currentOperation.operation]) {
                    let generated = template[currentOperation.type][currentOperation.operation];
                    switch (currentOperation.type) {
                        case 'special':
                            switch (currentOperation.operation) {
                                case '^':
                                    if (/\d+/g.test(currentVariable)) {
                                        let parsedNum = parseInt(currentVariable);
                                        if (0 < parsedNum && parsedNum <= settings.exponent_limit) {
                                            let setup = generated[0];
                                            let line = generated[1];
                                            result.push(formatScoreboard(setup, mainSelector, currentVariable, scoreboard));
                                            for (let j = 1; j < parsedNum; j++) {
                                                result.push(formatScoreboard(line, mainSelector, currentVariable, scoreboard));
                                            }
                                        }
                                        else {
                                            return callback(null, { message: errorMessage.operator["^"].tooBig });
                                        }
                                    }
                                    else {
                                        return callback(null, { message: errorMessage.operator["^"].ontInteger });
                                    }
                                    break;
                                default:
                                    return callback(null, { message: errorMessage.invalid });
                            }
                            break;
                        default:
                            for (let line of generated) {
                                result.push(formatScoreboard(line, mainSelector, currentVariable, scoreboard));
                            }
                    }
                }
                else {
                    return callback(null, { message: errorMessage.invalid });
                }
            }
            return callback(result, null);
        }
        else {
            return callback(null, { message: errorMessage.invalid });
        }
    }
    else {
        return callback(null, { message: errorMessage.invalid });
    }
};

function formatScoreboard(string, mainSelector, currentVariable, scoreboard) {
    return string.replace(/<selector>/g, mainSelector)
        .replace(/<selector1>/g, mainSelector)
        .replace(/<selector2>/g, currentVariable)
        .replace(/<value>/g, currentVariable)
        .replace(/<scoreboard>/g, scoreboard[0])
        .replace(/<scoreboard1>/g, scoreboard[0])
        .replace(/<scoreboard2>/g, scoreboard[1]);
}

/*
 * Convert math expression into usable array of variable and operator
 * @return [[array of variable], [array of operator]]
*/
function assertEquation(equation) {
    let brackets = ['[', ']', '{', '}', '(', ')'];
    let quotes = ['"', "'"];
    let bracketTable = {
        '[': ']',
        '{': '}',
        '(': ')',
        ']': '[',
        '}': '{',
        ')': '('
    };
    let operatorRegex = /[\+\-\*\/\%\^]/;
    let buffer = '';
    let indent = '';
    let quote = '';
    let breakpoint = false;
    let mode = 'string';
    let result = [[], []];
    for (let i = 0; i < equation.length; i++) {
        breakpoint = false;
        let char = equation[i];
        if (!breakpoint) {
            if (char === '\\') {
                breakpoint = true;
            }
            else if (quotes.includes(char)) {
                if (char === quote[quote.length - 1]) {
                    quote = quote.length === 1 ? '' : quote.substring(0, quote.length);
                }
                else {
                    quote += char;
                }
            }
            else if (brackets.includes(char)) {
                if (bracketTable[char] === indent[indent.length - 1]) {
                    indent = indent.length === 1 ? '' : indent.substring(0, indent.length);
                }
                else {
                    indent += char;
                }
            }
        }

        if (!quote && !breakpoint && !indent) {
            let regResult = operatorRegex.test(char);
            if (char === ' ') {
                char = '';
            }
            if (mode === 'string') {
                if (regResult) {
                    result[0].push(buffer);
                    buffer = '';
                    mode = 'operator';
                }
            }
            else if (mode === 'operator') {
                if (!regResult) {
                    result[1].push(buffer);
                    buffer = '';
                    mode = 'string';
                }
            }
        }
        buffer += char;
        if (equation.length === i + 1) {
            if (mode === 'string') {
                result[0].push(buffer);
                buffer = '';
                mode = 'operator';
            }
            else if (mode === 'operator') {
                result[1].push(buffer);
                buffer = '';
                mode = 'string';
            }
        }

    }
    return result;
}

function determineOperator(operator, variable) {
    let numberTestRegex = /\d/g;
    let operationRegex = /[\+\-\*\/\%]/g;
    let specials = ['^'];
    if (numberTestRegex.test(variable) && /[\+\-]/g.test(operator)) {
        return { type: 'normal', operation: operator };
    }
    else if (operationRegex.test(operator)) {
        return { type: 'operation', operation: operator };
    }
    else if (specials.includes(operator)) {
        return { type: 'special', operation: operator };
    }
    else {
        return null;
    }
}