// 25.04.2020


export let XMLHttpRequest = globalThis.XMLHttpRequest;
export let network = new EventTarget();
export let fetch = globalThis.fetch;




globalThis.XMLHttpRequest = class extends XMLHttpRequest {
  _request_body = null;
  _request_headers = {};
  _url = '';
  
  
  
  
  _onLoad() {
    let detail = {
      request_body: this._request_body,
      request_headers: this._request_headers,
      response_body: this.response,
      url: this._url,
    };
    let event = new CustomEvent('response', {detail});
    network.dispatchEvent(event);
  }
  
  
  
  
  open() {
    super.open(...arguments);
    
    this._url = arguments[1];
    
    this.addEventListener('load', this._onLoad);
  }
  
  
  send(body) {
    super.send(...arguments);
    
    this._request_body = body;
  }
  
  
  setRequestHeader(name, value) {
    super.setRequestHeader(...arguments);
    
    this._request_headers[name] = value;
  }
};




globalThis.fetch = function (request) {
  if (!(request instanceof Request)) {
    request = new Request(...arguments);
  }
  
  let event = new CustomEvent('request', {cancelable: true, detail: {request}});
  
  if (!network.dispatchEvent(event)) return;
  
  return fetch(request);
};
