import type {
  CalculateChainInput,
  ProductionEdge,
  ProductionNode,
  Byproduct,
} from "@/lib/calculators/factory-calc";

export type WorkerCalculatePayload = Omit<
  CalculateChainInput,
  "enabledAlternates" | "disabledBaseRecipes"
> & {
  enabledAlternates: string[];
  disabledBaseRecipes: string[];
  byproductHandlers?: Record<string, string | null>;
  /** Optional toggle to emit profiling logs from worker and main thread */
  profile?: boolean;
};

export type FactoryWorkerRequest = {
  type: "calc";
  id: number;
  payload: WorkerCalculatePayload;
};

export type FactoryWorkerSuccess = {
  type: "calc-result";
  id: number;
  nodes: ProductionNode[];
  edges: ProductionEdge[];
  byproducts: Byproduct[];
};

export type FactoryWorkerFailure = {
  type: "calc-error";
  id: number;
  error: string;
};

export type FactoryWorkerResponse = FactoryWorkerSuccess | FactoryWorkerFailure;

export type FactoryWorkerMessage = FactoryWorkerRequest | FactoryWorkerResponse;
