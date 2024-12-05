// DAG.ts
export class DAG<T> {
    private nodes: Map<T, Set<T>> = new Map();

    addNode(node: T): void {
        if (!this.nodes.has(node)) {
            this.nodes.set(node, new Set());
        }
    }

    addEdge(from: T, to: T): void {
        this.addNode(from);
        this.addNode(to);
        this.nodes.get(from)!.add(to);
    }

    topologicalSort(): T[] {
        const visited = new Set<T>();
        const temp = new Set<T>();
        const order: T[] = [];

        const visit = (node: T): void => {
            if (temp.has(node)) {
                throw new Error("Graph has a cycle");
            }
            if (!visited.has(node)) {
                temp.add(node);
                const neighbors = this.nodes.get(node) || new Set();
                for (const neighbor of neighbors) {
                    visit(neighbor);
                }
                temp.delete(node);
                visited.add(node);
                order.unshift(node);
            }
        };

        for (const node of this.nodes.keys()) {
            if (!visited.has(node)) {
                visit(node);
            }
        }

        return order;
    }
}
