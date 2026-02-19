export interface AssertionSource {
  name: string;
  arguments: Record<string, any> | null;
}

export interface Assertion {
  name: string;
  value: boolean;
  reason: string | null;
  source: AssertionSource;
}

export interface MetaUsage {
  output_tokens: number;
  input_tokens: number;
}

export interface MetaProvider {
  name: string;
}

export interface MetaRequest {
  model: string;
}

export interface InputMeta {
  request: MetaRequest;
  provider: MetaProvider;
  usage: MetaUsage;
  duration: number;
}

export interface Inputs {
  prompt: string;
  response: string;
  meta: InputMeta;
}

export interface CaseAttributes {
  input_tokens?: number;
  output_tokens?: number;
  model?: string;
  [key: string]: any;
}

export interface Case {
  name: string;
  inputs: Inputs;
  metadata: InputMeta; // Sometimes metadata is at root of case, sometimes in inputs
  expected_output?: string;
  output: string;
  metrics?: Record<string, any>;
  attributes?: CaseAttributes;
  scores?: Record<string, any>;
  labels?: Record<string, any>;
  assertions: Record<string, Assertion>;
  task_duration?: number;
  total_duration?: number;
  trace_id?: string | null;
  span_id?: string | null;
  evaluator_failures?: any[];
}

export interface Report {
  name: string;
  cases: Case[];
  failures: any[];
  experiment_metadata?: any;
  trace_id?: string | null;
  span_id?: string | null;
}
