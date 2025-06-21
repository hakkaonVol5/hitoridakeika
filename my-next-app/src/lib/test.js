// 文字列逆順問題の実行
const executeReverseStringCode = (code: string, testCases: TestCase[]): TestResult[] => {
    const results: TestResult[] = [];

    try {
        // 'reverseString' 関数と 'runReverseStringTest' 関数を動的に作成
        // new Function() を使用して、より安全なスコープでコードを実行
        const factoryFunc = new Function(
            'testCase', // 引数として受け取るもの
            `
            ${code} // ユーザーが提供したコード (例: reverseString関数)

            function runReverseStringTest(testCase) {
                try {
                    // ここでは outer testCase を参照できるよう、引数として渡す
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
            return runReverseStringTest(testCase); // ここで直接関数を呼び出す
            `
        );

        for (const testCase of testCases) {
            try {
                // factoryFunc を呼び出し、runReverseStringTest の結果を取得
                // new Function() はその場で評価・実行されるため、呼び出し方を調整
                const testResult = factoryFunc(testCase); // testCaseを引数として渡す
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
        // factoryFunc の作成自体でエラーが発生した場合
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
