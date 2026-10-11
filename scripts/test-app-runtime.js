// Test script to run app.js in simulated DOM environment
const fs = require('fs');

// Mock browser objects
global.window = global;
global.localStorage = {
  getItem: (k) => null,
  setItem: (k, v) => {},
  removeItem: (k) => {}
};
global.document = {
  addEventListener: (e, fn) => { global.domLoaded = fn; },
  getElementById: (id) => ({
    style: {},
    classList: { add: ()=>{}, remove: ()=>{}, toggle: ()=>{} },
    appendChild: ()=>{},
    innerHTML: '',
    value: '',
    querySelectorAll: () => []
  }),
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: () => ({ style: {}, classList: { add: ()=>{}, remove: ()=>{} }, appendChild: ()=>{} }),
  body: { classList: { add: ()=>{}, remove: ()=>{} }, style: {} }
};

try {
  const code = fs.readFileSync('app.js', 'utf8');
  eval(code);
  console.log('EVAL SUCCEEDED! Now testing DOMContentLoaded initApp...');
  if (global.domLoaded) {
    global.domLoaded();
    console.log('initApp SUCCEEDED WITH ZERO ERRORS!');
  }
} catch (err) {
  console.error('SIMULATED RUNTIME ERROR:', err);
}
