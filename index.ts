import './style.css';
import '@babel/polyfill'
import { Node } from "rete";
import Rete from "rete";
import ConnectionPlugin from 'rete-connection-plugin';
import VueRenderPlugin from 'rete-vue-render-plugin';
import { NodeData,WorkerInputs,WorkerOutputs } from 'rete/types/core/data';
import ContextMenuPlugin from 'rete-context-menu-plugin';
import { download } from './download';
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

interface Instance {
  name: string,
  type: string
}

interface Data{
  passes: Pass[];
  valueTypes: ValueType[];
  instances: Instance[]
}

// Factory method returning builders
const createComponent = (pass: Pass, sockets: Rete.Socket[])  => {
  return class extends Rete.Component {
  builder(node: Node): Promise<void> {
      // pridame inputy
     pass.inputs.forEach(input => {
      const foundSocket = sockets.find(s => s.name == input.type);
      const newInput = new Rete.Input(pass.name + "/" + input.name, input.name, foundSocket);
      node.addInput(newInput);
     });

        // pridame outputy
        pass.outputs.forEach(input => {
          const foundSocket = sockets.find(s => s.name == input.type);
          const newOutput = new Rete.Output(pass.name + "/" + input.name, input.name, foundSocket);
          node.addOutput(newOutput);
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


// SETUP
const data: Data = jsonData;
const container = document.getElementById("rete");
const editor = new Rete.NodeEditor('demo@0.1.0', container);
editor.use(ConnectionPlugin);
editor.use(VueRenderPlugin);
editor.use(ContextMenuPlugin, {
  searchBar: false, 
  searchKeep: title => true,
  delay: 100,
  rename(component) {
      return component.name;
  },
  nodeItems: {
      'Delete': true, 
      'Clone': true 
  }
});


// Passes definitions
const sockets = data.valueTypes.map(vType => new Rete.Socket(vType.name));
const factories = data.passes.map(def => createComponent(def, sockets));
const builders = factories.map(f => new f());
builders.forEach(b => editor.register(b));


// instances
data.instances.forEach(async instance=> {

  const foundBuilder = builders.find(x=> x.name == instance.type) as Rete.Component;
  const node = await foundBuilder.createNode();
  editor.addNode(node);
});


editor.on('nodecreated noderemoved connectioncreated connectionremoved', async () => {
  console.log(editor.toJSON());
});



window.saveToFile = () => {

  let fileContent = {
    ...data,
    editor: editor.toJSON()
  };
 download(JSON.stringify(fileContent, null, 2), "data.json", "application/json");
};