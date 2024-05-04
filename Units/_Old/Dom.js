export class Dom extends DocumentFragment {
  _cloneNode(node, nodeClones_count) {
    let nodeClones = [];
    
    for (let i = 0; i < nodeClones_count; i++) {
      let nodeClone = node.cloneNode(true);
      
      nodeClones.push(nodeClone);
    }
    
    return nodeClones;
  }
  
  
  _procNodeImage(nodeImage) {
    let [node, nodeClass, nodesCount = 1, nodeAttrs, ...nodesImages] = nodeImage;
    
    if (typeof node == 'string') {
      node = document.createElement(node);
    }
    else if (node instanceof Function) {
      node = node();
    }
    
    this._setElementAttrs(node, nodeAttrs);
    
    if (nodeClass) {
      node.className = `${nodeClass} ${node.className}`.trim();
    }
    
    this._procNodesImages(node, nodesImages);
    
    let nodeClones = this._cloneNode(node, nodesCount - 1);
    
    return [node, ...nodeClones];
  }
  
  
  _procNodesImages(targetNode, nodesImages) {
    for (let nodeImage of nodesImages) {
      if (nodeImage instanceof Array) {
        let nodes = this._procNodeImage(nodeImage);
        
        targetNode.append(...nodes);
      }
      else if (typeof nodeImage == 'string' && targetNode instanceof HTMLElement) {
        targetNode.insertAdjacentHTML('beforeEnd', nodeImage);
      }
      else {
        targetNode.append(nodeImage);
      }
    }
  }
  
  
  _setElementAttrs(element, attrs) {
    if (!(element instanceof HTMLElement)) return;
    
    for (let k in attrs) {
      element.setAttribute(k, attrs[k]);
    }
  }
  
  
  
  
  // cloneNode() {
  //   let dom = new this.constructor();
  //   let nodeClone = super.cloneNode(true);
    
  //   dom.append(nodeClone);
    
  //   return dom;
  // }
  
  
  addNodes(nodesImages) {
    if (!(nodesImages instanceof Array)) return;
    
    this._procNodesImages(this, nodesImages);
  }
  
  
  constructor(nodesImages) {
    super();
    
    this.addNodes(nodesImages);
  }
}

