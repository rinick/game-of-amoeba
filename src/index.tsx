import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './App';
import {initLan} from './Util';
import {defaultPreset} from './Presets';

initLan();
(async () => {
  await defaultPreset.load();
  ReactDOM.render(<App />, document.querySelector('#app'));
})();
