
// Graph.test.ts
import { describe, it, expect } from 'vitest';
import { DAG } from './Graph';

describe('DAG', () => {
    it('should perform topological sort on simple graph', () => {
        const dag = new DAG<number>();
        dag.addEdge(1, 2);
        dag.addEdge(2, 3);
        dag.addEdge(1, 3);

        const result = dag.topologicalSort();
        expect(result).toEqual([1, 2, 3]);
    });

    it('should detect cycles', () => {
        const dag = new DAG<string>();
        dag.addEdge('A', 'B');
        dag.addEdge('B', 'C');
        dag.addEdge('C', 'A');

        expect(() => dag.topologicalSort()).toThrow('Graph has a cycle');
    });

    it('should handle disconnected components', () => {
        const dag = new DAG<number>();
        dag.addEdge(1, 2);
        dag.addEdge(3, 4);

        const result = dag.topologicalSort();
        expect(result.length).toBe(4);
        expect(result).toContain(1);
        expect(result).toContain(2);
        expect(result).toContain(3);
        expect(result).toContain(4);
    });
});