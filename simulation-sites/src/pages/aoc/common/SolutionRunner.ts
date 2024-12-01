export interface Solution<T, R> {
  parseInput: (input: string) => T;
  part1: (input: T) => R;
  part2: (input: T) => R;
  explanation: {
    part1: string;
    part2: string;
  };
  testCases: {
    input: string;
    expected: {
      part1: R;
      part2: R;
    };
  };
}

export interface SolutionResult {
  result: string;
  runtime: string;
  testResult?: {
    success: boolean;
    expected: string;
    actual: string;
  };
}

export function runSolution<T, R>(
  solution: Solution<T, R>,
  input: string
): { part1: SolutionResult; part2: SolutionResult } {
  const runPart = (solutionFn: (input: T) => R, testExpected?: R): SolutionResult => {
    // Run test case first if it exists
    let testResult;
    if (solution.testCases) {
      const testInput = solution.parseInput(solution.testCases.input);
      const testActual = solutionFn(testInput);
      testResult = {
        success: testActual === testExpected,
        expected: testExpected?.toString() ?? "",
        actual: testActual?.toString() ?? "",
      };
    }

    // Run actual solution
    const parsedInput = solution.parseInput(input);
    const startTime = performance.now();
    const result = solutionFn(parsedInput);
    const endTime = performance.now();
    const runtime = (endTime - startTime).toFixed(2);

    return {
      result: result?.toString() ?? "",
      runtime: `${runtime}ms`,
      testResult,
    };
  };

  return {
    part1: runPart(solution.part1, solution.testCases?.expected.part1),
    part2: runPart(solution.part2, solution.testCases?.expected.part2),
  };
}
