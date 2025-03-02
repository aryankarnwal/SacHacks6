// components/InventoryForm.js
'use client';
import { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';

// Sample inventory items - replace with your actual items
const inventoryItems = [
  { id: 1, name: 'axe' },
  { id: 2, name: 'extinguisher' },
  { id: 3, name: 'first aid kit' },
  // Add more items as needed
];

export default function InventoryForm() {
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { inventoryList, setInventoryList } = useInventory();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedItem) return;
    
    // Add item to inventory list
    setInventoryList([
      ...inventoryList,
      { 
        id: Date.now(), // temporary unique ID
        itemId: selectedItem,
        itemName: inventoryItems.find(item => item.id == selectedItem)?.name,
        quantity,
        currentQuantity: quantity // Initialize currentQuantity equal to quantity
      }
    ]);
    
    // Reset form
    setSelectedItem('');
    setQuantity(1);
  };

  // Function to remove an item from the inventory list
  const removeItem = (itemId) => {
    setInventoryList(inventoryList.filter(item => item.id !== itemId));
  };
  return (
    <div className="w-full max-w-4xl">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="item">
            Select Item
          </label>
          <select
            id="item"
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select an item</option>
            {inventoryItems.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add to Inventory
          </button>
        </div>
      </form>
      
      {/* Display current inventory with remove functionality */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Current Inventory</h2>
        {inventoryList.length === 0 ? (
          <p className="text-gray-800">No items added yet.</p>
        ) : (
          <ul className="text-gray-800">
            {inventoryList.map(item => (
              <li key={item.id} className="mb-3 pb-2 border-b flex justify-between items-center">
                <span className="text-gray-800 font-medium">
                  {item.itemName} - Quantity: {item.quantity}
                </span>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                  type="button"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}