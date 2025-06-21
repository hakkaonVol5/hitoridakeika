import { TestCase, TestResult, CodeExecutionResult } from '../types/game';

// 安全なコード実行環境（簡易版）
export const executeCode = (code: string, testCases: TestCase[], nonVisibleTestCases: TestCase[]): CodeExecutionResult => {
    const results: TestResult[] = [];
    const nonVisibleResults: TestResult[] = [];

    try {
        // コードを実行可能な関数に変換
        const functionCode = `
      ${code}
      
      // テスト実行用のヘルパー関数
      function runTest(testCase) {
        try {
          // 関数名を自動検出
          const functionNames = ['reverseString', 'sumArray', 'findMax'];
          let result = null;
          
          for (const funcName of functionNames) {
            if (typeof eval(funcName) === 'function') {
              const input = eval(testCase.input);
              result = eval(funcName)(input);
              break;
            }
          }
          
          if (result === null) {
            throw new Error('実行可能な関数が見つかりません');
          }
          
          const expected = testCase.expectedOutput;
          const actual = String(result);
          
          return {
            passed: actual === expected,
            actualOutput: actual,
            error: null
          };
        } catch (error) {
          return {
            passed: false,
            actualOutput: null,
            error: error.message
          };
        }
      }
    `;

        // コードを実行
        eval(functionCode);

        // 各テストケースを実行
        for (const testCase of testCases) {
            try {
                const testResult = eval('runTest')(testCase);
                results.push({
                    testCase,
                    passed: testResult.passed,
                    actualOutput: testResult.actualOutput,
                    error: testResult.error
                });
            } catch (error) {
                results.push({
                    testCase,
                    passed: false,
                    actualOutput: undefined,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

    } catch (error) {
        // コード実行エラーの場合
        for (const testCase of testCases) {
            results.push({
                testCase,
                passed: false,
                actualOutput: undefined,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    return {results, nonVisibleResults};
};

// コードの構文チェック
export const validateCode = (code: string): { isValid: boolean; error?: string } => {
    try {
        // 構文チェック
        new Function(code);
        return { isValid: true };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

// 特定の問題に対するコード実行
export const executeProblemCode = (problemId: string, code: string, testCases: TestCase[], nonVisibleTestCases: TestCase[]): CodeExecutionResult => {
    // 問題固有の実行ロジック
    switch (problemId) {
        case 'reverse-string':
            return executeReverseStringCode(code, testCases, nonVisibleTestCases);
        case 'sum-array':
            return executeSumArrayCode(code, testCases, nonVisibleTestCases);
        case 'find-max':
            return executeFindMaxCode(code, testCases, nonVisibleTestCases);
        default:
            return executeCode(code, testCases, nonVisibleTestCases);
    }
};

// 文字列逆順問題の実行
const executeReverseStringCode = (code: string, testCases: TestCase[], nonVisibleTestCases: TestCase[]): CodeExecutionResult => {
    const results: TestResult[] = [];
    const nonVisibleResults: TestResult[] = [];

    try {
        // コードを実行可能にする
        const factoryFunc = new Function(
          'testCase', // 引数として受け取るもの
          `
          ${code}
          
          function runReverseStringTest(testCase) {
            try {
              const result = reverseString(testCase.input);
              const expected = testCase.expectedOutput;
              const actual = String(result);
              
              return {
                passed: actual === expected,
                actualOutput: actual,
                error: null
              };
            } catch (error) {
              return {
                passed: false,
                actualOutput: null,
                error: error.message
              };
            }
          }
          return runReverseStringTest(testCase);
        `);


        for (const testCase of testCases) {
            try {
                const testResult = factoryFunc(testCase);
                results.push({
                    testCase,
                    passed: testResult.passed,
                    actualOutput: testResult.actualOutput,
                    error: testResult.error
                });
            } catch (error) {
                results.push({
                    testCase,
                    passed: false,
                    actualOutput: undefined,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        for (const testCase of nonVisibleTestCases) {
            try {
                const testResult = factoryFunc(testCase);
                nonVisibleResults.push({
                    testCase,
                    passed: testResult.passed,
                    actualOutput: testResult.actualOutput,
                    error: testResult.error
                });
            } catch (error) {
                nonVisibleResults.push({
                    testCase,
                    passed: false,
                    actualOutput: undefined,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

    } catch (error) {
        for (const testCase of testCases) {
            results.push({
                testCase,
                passed: false,
                actualOutput: undefined,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    return {results, nonVisibleResults};
};

// 配列合計問題の実行
export const executeSumArrayCode = (code: string, testCases: TestCase[], nonVisibleTestCases: TestCase[]): CodeExecutionResult => {
    const results: TestResult[] = [];
    const nonVisibleResults: TestResult[] = [];

    try {
        // new Function に渡す引数を testCaseInput と testCaseExpectedOutput に変更
        const factoryFunc = new Function(
            'testCaseInput', // JSON.parseされた配列が入る
            'testCaseExpectedOutput', // parseIntされた数値が入る
            `
            ${code}
            
            function runSumArrayTest(inputArray, expectedNumber) {
                try {
                    // sumArray関数を呼び出す
                    const result = sumArray(inputArray);
                    const actual = result;
                    
                    return {
                        passed: actual === expectedNumber, // 数値同士を比較
                        actualOutput: String(actual), // 表示用に文字列に変換
                        error: null
                    };
                } catch (error) {
                    return {
                        passed: false,
                        actualOutput: null,
                        error: error instanceof Error ? error.message : 'Unknown error' // エラーメッセージを正しく取得
                    };
                }
            }
            // factoryFuncが呼び出されたら、runSumArrayTestInternalを呼び出して結果を返す
            return runSumArrayTest(testCaseInput, testCaseExpectedOutput);
            `
        );

        // testCases のループ処理
        for (const testCase of testCases) {
            try {
                // 入力と期待値を安全にパース
                const inputParsed = JSON.parse(testCase.input);
                const expectedParsed = parseFloat(testCase.expectedOutput); // 小数点がある可能性を考慮してparseFloat

                // factoryFunc を呼び出し、パースした引数を渡す
                const testResult = factoryFunc(inputParsed, expectedParsed);
                results.push({
                    testCase,
                    passed: testResult.passed,
                    actualOutput: testResult.actualOutput,
                    error: testResult.error
                });
            } catch (error) {
                results.push({
                    testCase,
                    passed: false,
                    actualOutput: undefined,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        // nonVisibleTestCases のループ処理を追加
        for (const testCase of nonVisibleTestCases) {
            try {
                const inputParsed = JSON.parse(testCase.input);
                const expectedParsed = parseFloat(testCase.expectedOutput);
                const testResult = factoryFunc(inputParsed, expectedParsed);
                nonVisibleResults.push({
                    testCase,
                    passed: testResult.passed,
                    actualOutput: testResult.actualOutput,
                    error: testResult.error
                });
            } catch (error) {
                nonVisibleResults.push({
                    testCase,
                    passed: false,
                    actualOutput: undefined,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

    } catch (error) {
        // factoryFunc の生成自体でエラーが発生した場合（例: ユーザーコードのシンタックスエラー）
        testCases.forEach(testCase => results.push({
            testCase,
            passed: false,
            actualOutput: undefined,
            error: error instanceof Error ? error.message : 'Unknown error'
        }));
        nonVisibleTestCases.forEach(testCase => nonVisibleResults.push({ // nonVisibleTestCasesも処理
            testCase,
            passed: false,
            actualOutput: undefined,
            error: error instanceof Error ? error.message : 'Unknown error'
        }));
    }

    return { results, nonVisibleResults };
};


// 最大値問題の実行
export const executeFindMaxCode = (code: string, testCases: TestCase[], nonVisibleTestCases: TestCase[]): CodeExecutionResult => {
    const results: TestResult[] = [];
    const nonVisibleResults: TestResult[] = [];

    try {
        // new Function に渡す引数を testCaseInput と testCaseExpectedOutput に変更
        const factoryFunc = new Function(
            'testCaseInput', // JSON.parseされた配列が入る
            'testCaseExpectedOutput', // parseIntされた数値が入る
            `
            ${code}
            
            function runFindMaxTest(inputArray, expectedNumber) {
                try {
                    const result = findMax(inputArray);
                    const actual = result;
                    
                    return {
                        passed: actual === expectedNumber, // 数値同士を比較
                        actualOutput: String(actual), // 表示用に文字列に変換
                        error: null
                    };
                } catch (error) {
                    return {
                        passed: false,
                        actualOutput: null,
                        error: error instanceof Error ? error.message : 'Unknown error' // エラーメッセージを正しく取得
                    };
                }
            }
            // factoryFuncが呼び出されたら、runFindMaxTestInternalを呼び出して結果を返す
            return runFindMaxTest(testCaseInput, testCaseExpectedOutput);
            `
        );

        // testCases のループ処理
        for (const testCase of testCases) {
            try {
                // 入力と期待値を安全にパース
                const inputParsed = JSON.parse(testCase.input);
                const expectedParsed = parseFloat(testCase.expectedOutput); // 期待値が小数点の可能性も考慮

                // factoryFunc を呼び出し、パースした引数を渡す
                const testResult = factoryFunc(inputParsed, expectedParsed);
                results.push({
                    testCase,
                    passed: testResult.passed,
                    actualOutput: testResult.actualOutput,
                    error: testResult.error
                });
            } catch (error) {
                results.push({
                    testCase,
                    passed: false,
                    actualOutput: undefined,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        // nonVisibleTestCases のループ処理を追加
        for (const testCase of nonVisibleTestCases) {
            try {
                const inputParsed = JSON.parse(testCase.input);
                const expectedParsed = parseFloat(testCase.expectedOutput);
                const testResult = factoryFunc(inputParsed, expectedParsed);
                nonVisibleResults.push({
                    testCase,
                    passed: testResult.passed,
                    actualOutput: testResult.actualOutput,
                    error: testResult.error
                });
            } catch (error) {
                nonVisibleResults.push({
                    testCase,
                    passed: false,
                    actualOutput: undefined,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

    } catch (error) {
        // factoryFunc の生成自体でエラーが発生した場合（例: ユーザーコードのシンタックスエラー）
        testCases.forEach(testCase => results.push({
            testCase,
            passed: false,
            actualOutput: undefined,
            error: error instanceof Error ? error.message : 'Unknown error'
        }));
        nonVisibleTestCases.forEach(testCase => nonVisibleResults.push({ // nonVisibleTestCasesも処理
            testCase,
            passed: false,
            actualOutput: undefined,
            error: error instanceof Error ? error.message : 'Unknown error'
        }));
    }

    return { results, nonVisibleResults };
};