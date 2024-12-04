import initSqlJs from 'sql.js';

interface SimulationParams {
    numGames: number;
    numPlayers: number;
    db: any;
}

interface BingoNumber {
    row: number;
    col: number;
    value: number;
}

interface GameResult {
    winningTurn: number;
    nextWinnerTurn: number | null;
    pattern: string;
    winningNumbers: BingoNumber[];
}

function generateCard(): number[][] {
    const card: number[][] = Array(5).fill(0).map(() => Array(5).fill(0));
    const used = new Set<number>();
    
    for (let col = 0; col < 5; col++) {
        const min = col * 15 + 1;
        const max = min + 14;
        
        for (let row = 0; row < 5; row++) {
            let num;
            do {
                num = Math.floor(Math.random() * (max - min + 1)) + min;
            } while (used.has(num));
            
            used.add(num);
            card[row][col] = num;
        }
    }
    
    return card;
}

function checkWin(marks: boolean[][]): boolean {
    // Check rows
    for (let row = 0; row < 5; row++) {
        if (marks[row].every(m => m)) return true;
    }
    
    // Check columns
    for (let col = 0; col < 5; col++) {
        if (marks.every(row => row[col])) return true;
    }
    
    // Check diagonals
    if (marks.every((row, i) => row[i])) return true;
    if (marks.every((row, i) => row[4 - i])) return true;
    
    return false;
}

function simulateGame(numPlayers: number): GameResult {
    const cards = Array(numPlayers).fill(0).map(() => generateCard());
    const marks = cards.map(() => Array(5).fill(0).map(() => Array(5).fill(false)));
    const numbers = Array.from({length: 75}, (_, i) => i + 1);
    let currentTurn = 0;
    let firstWinner = -1;
    let nextWinner = -1;
    let winningNumbers: BingoNumber[] = [];
    
    // Fisher-Yates shuffle
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    
    for (const number of numbers) {
        currentTurn++;
        
        for (let player = 0; player < numPlayers; player++) {
            const card = cards[player];
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    if (card[row][col] === number) {
                        marks[player][row][col] = true;
                        if (firstWinner === -1 && checkWin(marks[player])) {
                            firstWinner = currentTurn;
                            winningNumbers = card.map((rowNums, r) => 
                                rowNums.map((value, c) => ({
                                    row: r,
                                    col: c,
                                    value
                                }))
                            ).flat().filter(num => 
                                marks[player][num.row][num.col]
                            );
                        } else if (firstWinner !== -1 && nextWinner === -1 && checkWin(marks[player])) {
                            nextWinner = currentTurn;
                            break;
                        }
                    }
                }
            }
        }
        
        if (nextWinner !== -1) break;
    }
    
    return {
        winningTurn: firstWinner,
        nextWinnerTurn: nextWinner === -1 ? null : nextWinner,
        pattern: "standard", // For now just using standard pattern
        winningNumbers
    };
}

function simulateGames(numGames: number, numPlayers: number): GameResult[] {
    return Array(numGames).fill(0).map(() => simulateGame(numPlayers));
}

export async function runSimulation({ numGames, numPlayers, db }: SimulationParams) {
    // Insert new simulation record
    db.run(`
        INSERT INTO simulations (num_games, num_players, timestamp)
        VALUES (?, ?, ?)
    `, [numGames, numPlayers, Date.now()]);
    
    const simulationId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
    
    // Run games in batches to avoid memory issues
    const BATCH_SIZE = 1000;
    for (let gameId = 0; gameId < numGames; gameId += BATCH_SIZE) {
        const batch = Math.min(BATCH_SIZE, numGames - gameId);
        const games = simulateGames(batch, numPlayers);
        
        // Insert game results in a transaction
        db.run('BEGIN TRANSACTION');
        
        for (let i = 0; i < batch; i++) {
            const game = games[i];
            // Insert game results
            db.run(`
                INSERT INTO game_results 
                (simulation_id, game_id, winning_turn, next_winner_turn, winning_pattern)
                VALUES (?, ?, ?, ?, ?)
            `, [simulationId, gameId + i, game.winningTurn, game.nextWinnerTurn, game.pattern]);
            
            // Insert winning numbers
            for (const number of game.winningNumbers) {
                db.run(`
                    INSERT INTO winning_numbers
                    (simulation_id, game_id, row, col, number)
                    VALUES (?, ?, ?, ?, ?)
                `, [simulationId, gameId + i, number.row, number.col, number.value]);
            }
        }
        
        db.run('COMMIT');
    }
    
    return simulationId;
} 