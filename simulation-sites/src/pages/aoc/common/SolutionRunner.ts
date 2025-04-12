export interface Implementation<T, R> {
  name: string;
  part1: (input: T) => R;
  part2: (input: T) => R;
  explanation: {
    part1: string;
    part2: string;
  };
}

export interface Solution<T, R> {
  parseInput: (input: string) => T;
  implementations: Implementation<T, R>[];
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

export interface ImplementationResults {
  name: string;
  part1: SolutionResult;
  part2: SolutionResult;
}

export function runSolution<T, R>(
  solution: Solution<T, R>,
  input: string,
  skipInput: boolean = false
): ImplementationResults[] {
  const runPart = (solutionFn: (input: T) => R, testExpected?: R, skipInput: boolean = false): SolutionResult => {
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
    let result;
    if(!skipInput) {
      result = solutionFn(parsedInput);
    } else {
      result = -1;
    }
    const endTime = performance.now();
    const runtime = (endTime - startTime).toFixed(2);

    return {
      result: result?.toString() ?? "",
      runtime: `${runtime}ms`,
      testResult,
    };
  };

  return solution.implementations.map(implementation => ({
    name: implementation.name,
    part1: runPart(implementation.part1, solution.testCases?.expected.part1, skipInput),
    part2: runPart(implementation.part2, solution.testCases?.expected.part2, skipInput),
  }));
}
