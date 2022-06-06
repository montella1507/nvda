// styles
import './style.css';
// rete base
import '@babel/polyfill';
import { Node } from 'rete';
import Rete, { Socket, Component, Input } from 'rete';
import ConnectionPlugin from 'rete-connection-plugin';
import VueRenderPlugin from 'rete-vue-render-plugin';
import { NodeData, WorkerInputs, WorkerOutputs } from 'rete/types/core/data';
import ContextMenuPlugin from 'rete-context-menu-plugin';

// utility
import { download } from './download';
// Data
import jsonData from './data.json';

// Strongly-typing
import { Data, Pass } from './models';

// Factory method returning builders
const createBuilderClass = (pass: Pass, sockets: Socket[]) => {
  return class extends Component {
    builder(node: Node): Promise<void> {
      // pridame inputy
      pass.inputs.forEach((input) => {
        const foundSocket = sockets.find((s) => s.name == input.type);
        const newInput = new Rete.Input(
          pass.name + '::' + input.name,
          input.name,
          foundSocket
        );
        node.addInput(newInput);
      });

      // pridame outputy
      pass.outputs.forEach((input) => {
        const foundSocket = sockets.find((s) => s.name == input.type);
        const newOutput = new Rete.Output(
          pass.name + '::' + input.name,
          input.name,
          foundSocket
        );
        node.addOutput(newOutput);
      });

      return Promise.resolve();
    }
    worker(
      node: NodeData,
      inputs: WorkerInputs,
      outputs: WorkerOutputs,
      ...args: unknown[]
    ): void {}

    constructor() {
      super(pass.name);
    }
  };
};

// SETUP
const data: Data = jsonData;
const container = document.getElementById('rete');
const editor = new Rete.NodeEditor('demo@0.1.0', container);
editor.use(ConnectionPlugin);
editor.use(VueRenderPlugin);
editor.use(ContextMenuPlugin, {
  searchBar: false,
  searchKeep: (title) => true,
  delay: 100,
  rename(component) {
    return component.name;
  },
  nodeItems: {
    Delete: true,
    Clone: true,
  },
});

// Passes definitions
const sockets = data.valueTypes.map((vType) => new Rete.Socket(vType.name));

// Create components and register them to the editor
data.passes
  // Create class dynamically
  .map((def) => createBuilderClass(def, sockets))
  // Create instances
  .map((x) => new x())
  // Register component instances
  .forEach((b) => editor.register(b));


// instances - uncomment to test
// data.instances.forEach(async instance=> {

//   const foundBuilder = builders.find(x=> x.name == instance.type) as Component;
//   const node = await foundBuilder.createNode();
//   editor.addNode(node);
// });


editor.on(
  'nodecreated noderemoved connectioncreated connectionremoved',
  async () => {
    console.log(editor.toJSON());
  }
);

window.saveToFile = () => {
  let fileContent = {
    ...data,
    editor: editor.toJSON(),
  };
  download(
    JSON.stringify(fileContent, null, 2),
    'data.json',
    'application/json'
  );
};
