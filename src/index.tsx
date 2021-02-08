import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

// GAAAH nightmarish includes of runtime files to get gameengine to work.
// this is why we can't have nice things
// NOTE: the console.log below is MANDATORY -- if the resulting global is not referenced babel strips it
import "regenerator-runtime/runtime.js";
console.log('runtime exists?', regeneratorRuntime);

ReactDOM.render(<App />, document.getElementById('root'));