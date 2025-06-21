import { TestCase, TestResult } from '../types/game';

// 安全なコード実行環境（簡易版）
export const executeCode = (code: string, testCases: TestCase[]): TestResult[] => {
    const results: TestResult[] = [];

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

    return results;
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
export const executeProblemCode = (problemId: string, code: string, testCases: TestCase[]): TestResult[] => {
    // 問題固有の実行ロジック
    switch (problemId) {
        case 'reverse-string':
            return executeReverseStringCode(code, testCases);
        case 'sum-array':
            return executeSumArrayCode(code, testCases);
        case 'find-max':
            return executeFindMaxCode(code, testCases);
        default:
            return executeCode(code, testCases);
    }
};

// 文字列逆順問題の実行
const executeReverseStringCode = (code: string, testCases: TestCase[]): TestResult[] => {
    const results: TestResult[] = [];

    try {
        // コードを実行可能にする
        const functionCode = `
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
    `;

        eval(functionCode);

        for (const testCase of testCases) {
            try {
                const testResult = eval('runReverseStringTest')(testCase);
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
        for (const testCase of testCases) {
            results.push({
                testCase,
                passed: false,
                actualOutput: undefined,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    return results;
};

// 配列合計問題の実行
const executeSumArrayCode = (code: string, testCases: TestCase[]): TestResult[] => {
    const results: TestResult[] = [];

    try {
        const functionCode = `
      ${code}
      
      function runSumArrayTest(testCase) {
        try {
          const input = eval(testCase.input);
          const result = sumArray(input);
          const expected = parseInt(testCase.expectedOutput);
          const actual = result;
          
          return {
            passed: actual === expected,
            actualOutput: String(actual),
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

        eval(functionCode);

        for (const testCase of testCases) {
            try {
                const testResult = eval('runSumArrayTest')(testCase);
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
        for (const testCase of testCases) {
            results.push({
                testCase,
                passed: false,
                actualOutput: undefined,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    return results;
};

// 最大値問題の実行
const executeFindMaxCode = (code: string, testCases: TestCase[]): TestResult[] => {
    const results: TestResult[] = [];

    try {
        const functionCode = `
      ${code}
      
      function runFindMaxTest(testCase) {
        try {
          const input = eval(testCase.input);
          const result = findMax(input);
          const expected = parseInt(testCase.expectedOutput);
          const actual = result;
          
          return {
            passed: actual === expected,
            actualOutput: String(actual),
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

        eval(functionCode);

        for (const testCase of testCases) {
            try {
                const testResult = eval('runFindMaxTest')(testCase);
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
        for (const testCase of testCases) {
            results.push({
                testCase,
                passed: false,
                actualOutput: undefined,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    return results;
}; 