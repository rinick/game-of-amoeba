import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './App';
import {initLan} from './Util';

initLan();
ReactDOM.render(<App />, document.querySelector('#app'));
