import { TestCase, TestResult } from '../types/game';

// 問題ごとの実行関数
const problemExecutors: { [key: string]: (code: string, testCase: TestCase) => TestResult } = {
    'reverse-string': (code: string, testCase: TestCase): TestResult => {
        try {
            // コードを実行可能な形に変換
            const wrappedCode = `
                ${code}
                return reverseString(${JSON.stringify(testCase.input)});
            `;
            
            const func = new Function(wrappedCode);
            const result = func();
            
            return {
                testCase,
                passed: String(result) === testCase.expectedOutput,
                actualOutput: String(result)
            };
        } catch (error) {
            return {
                testCase,
                passed: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },
    
    'sum-array': (code: string, testCase: TestCase): TestResult => {
        try {
            // 配列の文字列を実際の配列に変換
            const inputArray = JSON.parse(testCase.input);
            
            const wrappedCode = `
                ${code}
                return sumArray(${JSON.stringify(inputArray)});
            `;
            
            const func = new Function(wrappedCode);
            const result = func();
            
            return {
                testCase,
                passed: String(result) === testCase.expectedOutput,
                actualOutput: String(result)
            };
        } catch (error) {
            return {
                testCase,
                passed: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
};

export const executeProblemCode = (
    problemId: string,
    code: string,
    testCases: TestCase[]
): TestResult[] => {
    const executor = problemExecutors[problemId];
    
    if (!executor) {
        return testCases.map(testCase => ({
            testCase,
            passed: false,
            error: `Problem executor not found for: ${problemId}`
        }));
    }
    
    return testCases.map(testCase => executor(code, testCase));
}; 