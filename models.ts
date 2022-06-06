// jen at mame strongly typing
export interface Input {
  name: string;
  type: string;  
}
export interface Output {
  name: string;
  type: string;  
}

export interface ValueType {
  name: string;
}

export interface Pass {
  name: string,
  inputs: Input[];
  outputs: Output[];
}

export interface Instance {
  name: string,
  type: string
}

export interface Data{
  passes: Pass[];
  valueTypes: ValueType[];
  instances: Instance[]
}