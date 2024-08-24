import { createContext, useContext, useEffect, useState } from 'react';
import { message } from 'antd';

const Context = createContext();

export const AntMessageProvider = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <Context.Provider
      value={messageApi}
    >
      {contextHolder}
      {children}
    </Context.Provider>
  );
};

export const useAntMessage = () => useContext(Context) || {};