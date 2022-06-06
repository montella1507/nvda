import './style.css';


import '@babel/polyfill'
import { Node } from "rete";
import Rete from "rete";
import ConnectionPlugin from 'rete-connection-plugin';
import VueRenderPlugin from 'rete-vue-render-plugin';
import AutoArrangePlugin from 'rete-auto-arrange-plugin';
import { NodeData,WorkerInputs,WorkerOutputs } from 'rete/types/core/data';



import jsonData from './data.json';

// jen at mame strongly typing
interface Input {
  name: string;
  type: string;  
}
interface Output {
  name: string;
  type: string;  
}

interface ValueType {
  name: string;
}


interface Pass {
  name: string,
  inputs: Input[];
  outputs: Output[];
}



interface Data{
  passes: Pass[];
  valueTypes: ValueType[];
}


const createComponent = (pass: Pass, sockets: Rete.Socket[])  => {
  return class extends Rete.Component {
  builder(node: Node): Promise<void> {
     
     // pridame inputy
     pass.inputs.forEach(input => {
      const foundSocket = sockets.find(s => s.name == input.type);
      const newInput = new Rete.Input(pass.name + "/" + input.name, foundSocket);
      node.addInput(newInput);
     });
     
    return Promise.resolve();
  }
  worker(node: NodeData,inputs: WorkerInputs,outputs: WorkerOutputs,...args: unknown[]): void {

}
      constructor() {
          super(pass.name);
      }
  } as Rete.Component;  
}



const data: Data = jsonData;
const container = document.getElementById("rete");
const editor = new Rete.NodeEditor('demo@0.1.0', container);
editor.use(ConnectionPlugin);
editor.use(VueRenderPlugin);
editor.use(AutoArrangePlugin, { margin: {x: 50, y: 50 }, depth: 0 }); 


const sockets = data.valueTypes.map(vType => new Rete.Socket(vType.name));


const factories = data.passes.map(def => createComponent(def));
const builders = factories.map(f => new f());
builders.forEach(b => editor.register(b));

// vytvoreni testovacich nodu
const nodes = data.passes.map(d => new Rete.Node(d.name));
nodes.forEach(n => editor.addNode(n));


const engine = new Rete.Engine('demo@0.1.0');


console.log(editor.toJSON());