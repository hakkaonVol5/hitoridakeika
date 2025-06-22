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
  // reverseStringが自動的に実行されるので消さないようにしてください。
  // reverseStringの引数strが与えられる文字列です。
  // reverseString関数の中を書き換えるだけでOKです。外から呼び出す必要はありません。
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
  // sumArrayが自動的に実行されるので消さないようにしてください。
  // sumArrayの引数arrが与えられる配列です。
  // sumArray関数の中を書き換えるだけでOKです。外から呼び出す必要はありません。
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
                input: '[1.5, 2.5, 3.0]', // 小数点のテストケースも追加
                expectedOutput: '7'
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
  // findMaxが自動的に実行されるので消さないようにしてください。
  // findMaxの引数arrが与えられる配列です。
  // findMax関数の中を書き換えるだけでOKです。外から呼び出す必要はありません。
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