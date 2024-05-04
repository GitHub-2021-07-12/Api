export class Css extends HTMLStyleElement {
  set rules(rules) {
    this.addRules(rules);
  }
  
  
  
  
  _rule_procProps(rule_props) {
    if (!(rule_props instanceof Object)) return rule_props;
    
    let rule_processedProps = {};
    
    for (let prop_name in rule_props) {
      let prop_value = rule_props[prop_name];
      
      if (prop_value instanceof Function) {
        let mixin = prop_value();
        
        mixin = this._rule_procProps(mixin);
        
        Object.assign(rule_processedProps, mixin);
      }
      else if (prop_value instanceof Object) {
        rule_processedProps[prop_name] = this._rule_procProps(prop_value);
      }
      else {
        prop_name = prop_name.replace('$', '--');
        
        if (!prop_name.startsWith('--')) {
          prop_name = prop_name.replace(/[A-Z]/g, '-$&').toLowerCase();
        }
        
        if (typeof prop_value == 'string' && prop_value.includes('$')) {
          prop_value = prop_value.toString().replace(/\$([-\w]+)/g, 'var(--$1)');
        }
        
        rule_processedProps[prop_name] = prop_value;
      }
    }
    
    return rule_processedProps;
  }
  
  
  _rule_toString(rule_selector, rule_props) {
    if (!(rule_props instanceof Object)) {
      return `${rule_props};`;
    }
    
    let rule_string = `${rule_selector} {`;
    
    for (let prop_name in rule_props) {
      let prop_value = rule_props[prop_name];
      
      if (prop_value instanceof Object) {
        rule_string += this._rule_toString(prop_name, prop_value);
        
        continue;
      }
      
      rule_string += `${prop_name}: ${prop_value};`;
    }
    
    rule_string += '}';
    
    return rule_string;
  }
  
  
  
  
  addRules(rules) {
    if (!rules) return;
    
    if (!(rules instanceof Object)) {
      this.textContent += rules;
      
      return;
    }
    
    let rules_string = '';
    
    for (let rule_selector in rules) {
      let rule_props = rules[rule_selector];
      
      rule_props = this._rule_procProps(rule_props);
      
      rules_string += this._rule_toString(rule_selector, rule_props);
    }
    
    this.textContent += rules_string;
  }
  
  
  constructor(rules) {
    super();
    
    this.addRules(rules);
  }
}




customElements.define('c-css', Css, {extends: 'style'});

