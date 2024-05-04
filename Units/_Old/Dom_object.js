export class Dom extends DocumentFragment {
  get image() {
    return this._image;
  }
  
  
  get nodeImages() {
    return this._nodeImages;
  }
  
  
  
  
  _cloneNode(node, nodeClonesCount) {
    let nodeClones = [];
    
    for (let i = 0; i < nodeClonesCount; i++) {
      let nodeClone = node.cloneNode(true);
      
      nodeClones.push(nodeClone);
    }
    
    return nodeClones;
  }
  
  
  _domImage_procArray(targetNode, domImage) {
    for (let nodeImage of domImage) {
      if (nodeImage instanceof Array) {
        let nodes = this._nodeImage_procArray(nodeImage);
        
        targetNode.append(...nodes);
      }
      else if (nodeImage instanceof Node) {
        let node = nodeImage.cloneNode(true);
        
        targetNode.append(node);
      }
      else if (targetNode instanceof HTMLElement) {
        targetNode.insertAdjacentHTML('beforeEnd', nodeImage);
      }
      else {
        targetNode.append(nodeImage);
      }
    }
  }
  
  
  _domImage_procObject(targetNode, domImage) {
    for (let k in domImage) {
      if (k.startsWith('__')) continue;
      
      let nodeImage = domImage[k];
      
      if (nodeImage instanceof Object) {
        let nodeName = k.replace(/__\d+$/, '');
        
        let nodes = this._nodeImage_procObject(nodeName, nodeImage);
        
        targetNode.append(...nodes);
      }
      else if (targetNode instanceof HTMLElement) {
        targetNode.insertAdjacentHTML('beforeEnd', nodeImage);
      }
      else {
        targetNode.append(nodeImage);
      }
    }
  }
  
  
  _nodeImage_procArray(nodeImage) {
    let [node, nodeName, nodesCount = 1, nodeAttrs, ...domImage] = nodeImage;
    
    if (typeof node == 'string') {
      node = document.createElement(node);
    }
    else if (node instanceof Function) {
      node = node();
    }
    
    this._setElementAttrs(node, nodeAttrs);
    
    if (nodeName) {
      this._nodeImages[nodeName] = nodeImage;
      
      node.className = `${nodeName} ${node.className}`.trim();
    }
    
    this._domImage_procArray(node, domImage);
    
    this._procNode && this._procNode(nodeName, node);
    
    return this._cloneNode(node, nodesCount);
  }
  
  
  _nodeImage_procObject(nodeName, nodeImage) {
    let node = nodeImage.__node || nodeImage;
    let nodesCount = 1;
    
    this._nodeImages[nodeName] = nodeImage;
    
    if (node instanceof Array) {
      [node, nodesCount = nodesCount] = node;
    }
    
    if (typeof node == 'string') {
      node = document.createElement(node);
    }
    else if (node instanceof Function) {
      node = node();
    }
    
    if (nodeImage.__node) {
      nodesCount = nodeImage.__count || nodesCount;
      
      this._setElementAttrs(node, nodeImage.__attrs);
      
      this._domImage_procObject(node, nodeImage);
    }
    
    if (node instanceof HTMLElement) {
      node.className = `${nodeName} ${node.className}`.trim();
    }
    
    this._procNode && this._procNode(nodeName, node);
    
    return this._cloneNode(node, nodesCount);
  }
  
  
  _setElementAttrs(element, attrs) {
    if (!(element instanceof HTMLElement)) return;
    
    for (let k in attrs) {
      element.setAttribute(k, attrs[k]);
    }
  }
  
  
  
  
  addNodes(domImage) {
    if (domImage instanceof Array) {
      this._domImage_procArray(this, domImage);
    }
    else if (domImage instanceof Object) {
      this._domImage_procObject(this, domImage);
    }
  }
  
  
  constructor(domImage, procNode = null) {
    super();
    
    this._image = domImage;
    this._nodeImages = {};
    this._procNode = procNode;
    
    this.addNodes(domImage);
  }
}

