import type { Grid } from './types';

export const stringToGrid = (str: string): Grid => {
  const grid: Grid = [];
  for (let i = 0; i < 9; i++) {
    grid.push(
      str
        .substring(i * 9, i * 9 + 9)
        .split('')
        .map(Number)
    );
  }
  return grid;
};

export const gridToString = (grid: Grid): string => {
  return grid.map(row => row.join('')).join('');
};

export const cloneGrid = (grid: Grid): Grid => {
    return grid.map(row => [...row]);
}

const isValid = (grid: Grid, row: number, col: number, num: number): boolean => {
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num || grid[x][col] === num) {
      return false;
    }
  }

  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }

  return true;
};


export const checkPuzzle = (userGrid: Grid, initialGrid: Grid, solutionGrid: Grid): boolean[][] => {
    const errors: boolean[][] = Array(9).fill(null).map(() => Array(9).fill(false));
    
    for (let r = 0; r < 9; r++) {
        for(let c = 0; c < 9; c++) {
            if (initialGrid[r][c] === 0 && userGrid[r][c] !== 0) {
                if (userGrid[r][c] !== solutionGrid[r][c]) {
                    errors[r][c] = true;
                }
            }
        }
    }
    return errors;
}

export const isPuzzleSolved = (userGrid: Grid, solutionGrid: Grid): boolean => {
    for (let r = 0; r < 9; r++) {
        for(let c = 0; c < 9; c++) {
            if (userGrid[r][c] !== solutionGrid[r][c]) {
                return false;
            }
        }
    }
    return true;
}
