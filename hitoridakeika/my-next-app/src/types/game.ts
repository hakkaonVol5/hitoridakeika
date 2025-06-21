export interface Player {
    id: string;
    name: string;
    turnOrder: number;
    isCurrentTurn: boolean;
}

export interface TestCase {
    input: string;
    expectedOutput: string;
    description: string;
}

export interface TestResult {
    testCase: TestCase;
    passed: boolean;
    actualOutput?: string;
    error?: string;
}

export interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit: number;
    maxPlayers: number;
    initialCode: string;
    testCases: TestCase[];
}

export interface Room {
    id: string;
    players: Player[];
    currentPlayerIndex: number;
    code: string;
    isGameActive: boolean;
    problem: Problem;
    turnLog: any[];
    startTime?: Date;
    endTime?: Date;
}

export interface GameResult {
    isSuccess: boolean;
    totalTime: number;
    turnLog: any[];
    finalCode: string;
    testResults: TestResult[];
}

export interface TurnLog {
    playerId: string;
    playerName: string;
    action: string;
    timestamp: Date;
    code?: string;
} 