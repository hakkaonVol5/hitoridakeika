export interface Player {
    id: string;
    name: string;
    isCurrentTurn: boolean;
    turnOrder: number;
}

export interface Room {
    id: string;
    players: Player[];
    currentPlayerIndex: number;
    code: string;
    isGameActive: boolean;
    startTime?: Date;
    endTime?: Date;
    problem: Problem;
    turnLog: TurnLog[];
}

export interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit: number; // 秒
    maxPlayers: number;
    testCases: TestCase[];
    initialCode: string;
}

export interface TestCase {
    input: string;
    expectedOutput: string;
    description?: string;
}

export interface TurnLog {
    playerId: string;
    playerName: string;
    startTime: Date;
    endTime: Date;
    duration: number; // 秒
}

export interface GameResult {
    isSuccess: boolean;
    totalTime: number; // 秒
    turnLog: TurnLog[];
    finalCode: string;
    testResults: TestResult[];
}

export interface TestResult {
    testCase: TestCase;
    passed: boolean;
    actualOutput?: string;
    error?: string;
}

export interface SocketEvents {
    // クライアント → サーバー
    'join-room': (data: { roomId: string; playerName: string }) => void;
    'leave-room': (data: { roomId: string; playerId: string }) => void;
    'update-code': (data: { roomId: string; code: string }) => void;
    'submit-code': (data: { roomId: string; code: string }) => void;
    'turn-complete': (data: { roomId: string; playerId: string }) => void;

    // サーバー → クライアント
    'room-joined': (data: { room: Room; playerId: string }) => void;
    'player-joined': (data: { player: Player }) => void;
    'player-left': (data: { playerId: string }) => void;
    'code-updated': (data: { code: string; playerId: string }) => void;
    'turn-changed': (data: { currentPlayer: Player; timeRemaining: number }) => void;
    'game-result': (data: { result: GameResult }) => void;
    'error': (data: { message: string }) => void;
} 