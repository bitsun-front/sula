/*
 * @Description: 
 * @Author: rodchen
 * @Date: 2022-07-03 21:13:14
 * @LastEditTime: 2022-07-03 22:47:54
 * @LastEditors: rodchen
 */
import React from 'react';

const LayouContext = React.createContext({
  isHorizontally: true,
  updateLayout: () => {}
});

export default LayouContext;