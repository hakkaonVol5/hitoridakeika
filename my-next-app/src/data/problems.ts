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
  // ここにコードを書いてください
  return str;
}

// テスト用
console.log(reverseString("hello")); // "olleh" が出力されるはず
console.log(reverseString("world")); // "dlrow" が出力されるはず`,
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
  return 0;
}

// テスト用
console.log(sumArray([1, 2, 3, 4, 5])); // 15 が出力されるはず
console.log(sumArray([10, 20, 30])); // 60 が出力されるはず`,
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
                input: '[]',
                expectedOutput: '0',
                description: '空配列'
            },
            {
                input: '[1]',
                expectedOutput: '1',
                description: '要素が1つの配列'
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
  return 0;
}

// テスト用
console.log(findMax([3, 7, 2, 9, 1])); // 9 が出力されるはず
console.log(findMax([-5, -2, -10, -1])); // -1 が出力されるはず`,
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