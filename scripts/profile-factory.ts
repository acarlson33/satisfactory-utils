import { performance } from "perf_hooks";
import { calculateChain } from "@/lib/calculators/factory-calc";

interface Scenario {
  label: string;
  targetItemId: string;
  targetRate: number;
  clockSpeed: number;
}

const scenarios: Scenario[] = [
  {
    label: "Iron Plates (base)",
    targetItemId: "iron-plate",
    targetRate: 120,
    clockSpeed: 100,
  },
  {
    label: "Reinforced Iron Plates (mid)",
    targetItemId: "reinforced-iron-plate",
    targetRate: 30,
    clockSpeed: 100,
  },
  {
    label: "Computers (late)",
    targetItemId: "computer",
    targetRate: 20,
    clockSpeed: 100,
  },
  {
    label: "Turbo Motors (endgame)",
    targetItemId: "turbo-motor",
    targetRate: 5,
    clockSpeed: 100,
  },
];

function runScenario(scenario: Scenario, iterations = 3) {
  const times: number[] = [];
  let lastNodes = 0;
  let lastEdges = 0;
  let lastByproducts = 0;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const { nodes, edges, byproducts } = calculateChain({
      targetItemId: scenario.targetItemId,
      targetRate: scenario.targetRate,
      clockSpeed: scenario.clockSpeed,
      enabledAlternates: new Set<string>(),
      selectedRecipes: {},
      buildingOverrides: {},
      disabledBaseRecipes: new Set<string>(),
      byproductHandlers: {},
    });
    const end = performance.now();
    times.push(end - start);
    lastNodes = nodes.length;
    lastEdges = edges.length;
    lastByproducts = byproducts.length;
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const max = Math.max(...times);
  const min = Math.min(...times);

  return {
    ...scenario,
    avg: Number(avg.toFixed(2)),
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    lastNodes,
    lastEdges,
    lastByproducts,
  };
}

async function main() {
  console.log("Factory calculation micro-profiling (local thread)\n");
  for (const scenario of scenarios) {
    const result = runScenario(scenario, 5);
    console.log(
      `- ${result.label}: avg ${result.avg}ms (min ${result.min}ms / max ${result.max}ms) | nodes ${result.lastNodes}, edges ${result.lastEdges}, byproducts ${result.lastByproducts}`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
