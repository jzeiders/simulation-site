export interface Solution<T, R> {
  parseInput: (input: string) => T;
  part1: (input: T) => R;
  part2: (input: T) => R;
  explanation: {
    part1: string;
    steps: string[];
  };
}

export interface SolutionResult {
  result: string;
  runtime: string;
}

export function runSolution<T, R>(
  solution: Solution<T, R>,
  input: string
): { part1: SolutionResult; part2: SolutionResult } {
  const parsedInput = solution.parseInput(input);

  const runPart = (solutionFn: (input: T) => R): SolutionResult => {
    const startTime = performance.now();
    const result = solutionFn(parsedInput);
    const endTime = performance.now();
    const runtime = (endTime - startTime).toFixed(2);

    return {
      result: result?.toString() ?? "",
      runtime: `${runtime}ms`,
    };
  };

  return {
    part1: runPart(solution.part1),
    part2: runPart(solution.part2),
  };
}
