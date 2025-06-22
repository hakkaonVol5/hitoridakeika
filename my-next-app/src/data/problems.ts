import { Problem } from '../types/game';

export const sampleProblems: Problem[] = [
    {
        id: 'reverse-string',
        title: '文字列を逆順にする',
        description: '与えられた文字列を逆順にして返す関数を作成してください。',
        difficulty: 'easy',
        timeLimit: 60,
        maxPlayers: 5,
        initialCode: `function reverseString(str) {
  // ここにコードを書いてください。
  // ※注意※
  // reverseStringの引数strが与えられる文字列です。
  // reverseString関数の中を書き換えるだけでOKです。
  // 自動的に実行されるので外から呼び出す必要はありません。
  // reverseString関数の返り値が実行評価に使われます。
  return str;
}`,
        testCases: [
            {
                input: 'hello',
                expectedOutput: 'olleh',
                description: '基本的な文字列の逆順'
            },
            {
                input: 'world',
                expectedOutput: 'dlrow',
                description: '別の文字列の逆順'
            },
            {
                input: '12345',
                expectedOutput: '54321',
                description: '数字の文字列'
            },
            {
                input: '',
                expectedOutput: '',
                description: '空文字列'
            }
        ],
        nonVisibleTestCases: [
            // 既存の4個
            {
                input: "programming",
                expectedOutput: "gnimmargorp"
            },
            {
                input: "racecar",
                expectedOutput: "racecar" // 回文
            },
            {
                input: "A",
                expectedOutput: "A" // 一文字
            },
            {
                input: "日本",
                expectedOutput: "本日" // 日本語文字列（文字単位で逆順）
            },
            // 追加する16個
            {
                input: "abcdefghijklmnopqrstuvwxyz",
                expectedOutput: "zyxwvutsrqponmlkjihgfedcba"
            },
            {
                input: "ZYXWVUTSRQPONMLKJIHGFEDCBA",
                expectedOutput: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            },
            {
                input: "abcABC!@#",
                expectedOutput: "#@!CBAcba"
            },
            {
                input: "space test",
                expectedOutput: "tset ecaps"
            },
            {
                input: "longwordtest",
                expectedOutput: "tsetdrowgnol"
            },
            {
                input: "Madam", // 大文字小文字混合の回文
                expectedOutput: "madaM"
            },
            {
                input: "wa", // 一桁の数字
                expectedOutput: "aw"
            },
            {
                input: "HelloWorld!",
                expectedOutput: "!dlroWolleH"
            },
            {
                input: "シングル", // 日本語
                expectedOutput: "ルグンシ"
            },
            {
                input: "あいうえお", // 日本語
                expectedOutput: "おえういあ"
            },
            {
                input: "english", 
                expectedOutput: "hsilgne"
            },
            {
                input: "a", // 短い一文字
                expectedOutput: "a"
            },
            {
                input: "ab", // 短い二文字
                expectedOutput: "ba"
            },
            {
                input: "aba", // 短い回文
                expectedOutput: "aba"
            },
            {
                input: "Test", // 大文字小文字混合
                expectedOutput: "tseT"
            },
            {
                input: "unyo", 
                expectedOutput: "oynu"
            }
        ]
    },
    {
        id: 'sum-array',
        title: '配列の合計を計算',
        description: '数値の配列を受け取り、その合計を返す関数を作成してください。',
        difficulty: 'easy',
        timeLimit: 60,
        maxPlayers: 5,
        initialCode: `function sumArray(arr) {
  // ここにコードを書いてください
  // ※注意※
  // sumArrayの引数arrが与えられる配列です。
  // sumArray関数の中を書き換えるだけでOKです。
  // 自動的に実行されるので外から呼び出す必要はありません。
  // sumArray関数の返り値が実行評価に使われます。
  return 0;
}
`,
        testCases: [
            {
                input: '[1, 2, 3, 4, 5]',
                expectedOutput: '15',
                description: '基本的な配列の合計'
            },
            {
                input: '[10, 20, 30]',
                expectedOutput: '60',
                description: '別の配列の合計'
            },
            {
                input: '[1.6, 2]',
                expectedOutput: '3.6',
                description: '小数'
            },
            {
                input: '[1]',
                expectedOutput: '1',
                description: '要素が1つの配列'
            }
        ],
        nonVisibleTestCases: [
            // 既存の5個
            {
                input: '[100, 200, 300, 400]',
                expectedOutput: '1000'
            },
            {
                input: '[-1, -2, -3]',
                expectedOutput: '-6'
            },
            {
                input: '[0, 0, 0, 0]',
                expectedOutput: '0'
            },
            {
                input: '[5, -5]',
                expectedOutput: '0'
            },
            {
                input: '[1.5, 2.5, 3.0]',
                expectedOutput: '7'
            },
            // 追加する15個
            {
                input: '[10, 10, 10, 10, 10, 10, 10, 10, 10, 10]',
                expectedOutput: '100'
            },
            {
                input: '[-10, -20, -30, -40, -50]',
                expectedOutput: '-150'
            },
            {
                input: '[100, -100, 50, -50]',
                expectedOutput: '0'
            },
            {
                input: '[0.1, 0.2, 0.3, 0.4]',
                expectedOutput: '1'
            },
            {
                input: '[100000, 200000, 300000]',
                expectedOutput: '600000'
            },
            {
                input: '[-0.5, -1.5, -2.5]',
                expectedOutput: '-4.5'
            },
            {
                input: '[0]',
                expectedOutput: '0'
            },
            {
                input: '[10.5]',
                expectedOutput: '10.5'
            },
            {
                input: '[2, 4, 6, 8, 10, 12, 14, 16, 18, 20]',
                expectedOutput: '110'
            },
            {
                input: '[-1, 1, -1, 1, -1, 1]',
                expectedOutput: '0'
            },
            {
                input: '[123, 456, 789]',
                expectedOutput: '1368'
            },
            {
                input: '[3.14, 2.71]',
                expectedOutput: '5.85'
            },
            {
                input: '[-100, 1, 99]',
                expectedOutput: '0'
            },
            {
                input: '[999999999]',
                expectedOutput: '999999999'
            },
            {
                input: '[-10, -20, 30, 40, -50]',
                expectedOutput: '-10'
            }
        ]
    },
    {
        id: 'find-max',
        title: '最大値を探す',
        description: '数値の配列を受け取り、その最大値を返す関数を作成してください。',
        difficulty: 'medium',
        timeLimit: 60,
        maxPlayers: 5,
        initialCode: `function findMax(arr) {
  // ここにコードを書いてください
  // ※注意※
  // findMaxの引数arrが与えられる配列です。
  // findMax関数の中を書き換えるだけでOKです。
  // 自動的に実行されるので外から呼び出す必要はありません。
  // findMax関数の返り値が実行評価に使われます。
  return 0;
}
`,
        testCases: [
            {
                input: '[3, 7, 2, 9, 1]',
                expectedOutput: '9',
                description: '正の数の配列'
            },
            {
                input: '[-5, -2, -10, -1]',
                expectedOutput: '-1',
                description: '負の数の配列'
            },
            {
                input: '[1]',
                expectedOutput: '1',
                description: '要素が1つの配列'
            },
            {
                input: '[0, 0, 0]',
                expectedOutput: '0',
                description: '同じ値の配列'
            }
        ],
        nonVisibleTestCases: [
            // 既存の5個
            {
                input: '[100, 50, 200, 150]',
                expectedOutput: '200'
            },
            {
                input: '[-100, -50, -200, -150]',
                expectedOutput: '-50'
            },
            {
                input: '[7, 7, 7]',
                expectedOutput: '7'
            },
            {
                input: '[9999]',
                expectedOutput: '9999'
            },
            {
                input: '[0, -1, 1]',
                expectedOutput: '1'
            },
            // 追加する15個
            {
                input: '[5, 12, 8, 3, 15, 6]',
                expectedOutput: '15'
            },
            {
                input: '[-1, -10, -3, -7, -2]',
                expectedOutput: '-1'
            },
            {
                input: '[0, 10, -5, 20, -15]',
                expectedOutput: '20'
            },
            {
                input: '[-10, 0, 10, -20, 0]',
                expectedOutput: '10'
            },
            {
                input: '[5.5, 2.1, 8.9, 3.2]',
                expectedOutput: '8.9'
            },
            {
                input: '[1000000, 1, 100, 1000]',
                expectedOutput: '1000000'
            },
            {
                input: '[-0.1, -0.01, -0.001]',
                expectedOutput: '-0.001'
            },
            {
                input: '[42]',
                expectedOutput: '42'
            },
            {
                input: '[1, 1, 2, 3, 5, 8]',
                expectedOutput: '8'
            },
            {
                input: '[-1, 0, 1]',
                expectedOutput: '1'
            },
            {
                input: '[123456789, 987654321]',
                expectedOutput: '987654321'
            },
            {
                input: '[-1, -1, -1, -1, -1]',
                expectedOutput: '-1'
            },
            {
                input: '[0.001, 0.0001, 0.01]',
                expectedOutput: '0.01'
            },
            {
                input: '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]',
                expectedOutput: '20'
            },
            {
                input: '[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]',
                expectedOutput: '10'
            }
        ]
    }
];

export const getRandomProblem = (): Problem => {
    const randomIndex = Math.floor(Math.random() * sampleProblems.length);
    return sampleProblems[randomIndex];
};

export const getProblemById = (id: string): Problem | undefined => {
    return sampleProblems.find(problem => problem.id === id);
}; 