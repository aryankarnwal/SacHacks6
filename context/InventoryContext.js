// context/InventoryContext.js
'use client';
import { createContext, useState, useContext } from 'react';

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [inventoryList, setInventoryList] = useState([]);

  return (
    <InventoryContext.Provider value={{ inventoryList, setInventoryList }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  return useContext(InventoryContext);
}