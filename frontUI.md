https://umijs.org/

https://dvajs.com/

https://umijs.org/guide/with-dva.html

https://github.com/dvajs/dva-docs/tree/master/v1/zh-cn/tutorial

http://redux.js.org/

#effects
https://redux-saga-in-chinese.js.org/
#generator
https://davidwalsh.name/es6-generators

# use css modules
- GetConnections.js
mystyle.module.css
```
.bigblue {
  color: DodgerBlue;
  padding: 40px;
  font-family: Arial;
  text-align: center;
}
```
App.js
```
import React from 'react';
import ReactDOM from 'react-dom/client';
import styles from './mystyle.module.css'; 

class Car extends React.Component {
  render() {
    return <h1 className={styles.bigblue}>Hello Car!</h1>;
  }
}

export default Car;
```
