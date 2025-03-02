// components/ImageUploadForm.js
'use client';
import { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import Image from 'next/image';

export default function ImageUploadForm() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [inventoryStatus, setInventoryStatus] = useState([]);
  const { inventoryList } = useInventory();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      // Send to our API endpoint
      const response = await fetch('/api/vision-analysis', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }
      
      const data = await response.json();
      setResults(data.results);
      
      // Process the results to count items and compare with inventory
      processInventoryStatus(data.results);
      
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Process inventory against vision results
  // Process inventory against vision results
const processInventoryStatus = (results) => {
    // Create a copy of inventory items
    const updatedInventory = inventoryList.map(item => ({
      ...item,
      itemsDetected: 0,
      currentQuantity: 0 // Start with zero detected
    }));
    
    // Count occurrences of items in the detected text
    if (results.text) {
      const text = results.text.toLowerCase();
      
      // For each inventory item, check if it appears in the text
      updatedInventory.forEach(item => {
        // Count how many times the item name appears in the text
        const itemNameLower = item.itemName.toLowerCase();
        const regex = new RegExp(itemNameLower, 'g');
        const matches = text.match(regex);
        
        if (matches) {
          item.itemsDetected += matches.length;
        }
      });
    }
    
    // Also check labels for item names
    if (results.labels && results.labels.length > 0) {
      results.labels.forEach(label => {
        const labelDesc = label.description.toLowerCase();
        
        updatedInventory.forEach(item => {
          if (labelDesc.includes(item.itemName.toLowerCase())) {
            item.itemsDetected += 1;
          }
        });
      });
    }
    
    // Set current quantity based on detected items
    updatedInventory.forEach(item => {
      item.currentQuantity = item.itemsDetected;
    });
    
    setInventoryStatus(updatedInventory);
  };

  return (
    <div className="w-full max-w-4xl">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
            Select Compartment Image
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-gray-700 border border-gray-300 rounded py-2 px-3 mb-4"
            required
          />
          
          {preview && (
            <div className="mt-4 mb-6">
              <p className="block text-gray-700 text-sm font-bold mb-2">Preview:</p>
              <div className="relative h-64 w-full border rounded overflow-hidden">
                <Image 
                  src={preview} 
                  alt="Image preview" 
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={!selectedFile || isAnalyzing}
            className={`${
              !selectedFile || isAnalyzing 
                ? 'bg-blue-300' 
                : 'bg-blue-500 hover:bg-blue-700'
            } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
          </button>
        </div>
      </form>
      
      {/* Display error if any */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Display analysis results */}
      {results && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Analysis Results</h2>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Detected Items</h3>
            {results.labels && results.labels.length > 0 ? (
              <ul className="list-disc pl-5 text-gray-800">
                {results.labels.map((label, index) => (
                  <li key={index} className="mb-1">
                    {label.description} (Confidence: {Math.round(label.score * 100)}%)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-800">No items detected</p>
            )}
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Inventory Status</h3>
            {inventoryStatus.length > 0 ? (
              <table className="min-w-full border-collapse text-gray-800">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Item Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Full Quantity</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Detected</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Remaining</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryStatus.map((item, index) => (
                    <tr key={index} className={item.currentQuantity === 0 ? "bg-red-50" : item.currentQuantity < item.quantity * 0.25 ? "bg-yellow-50" : ""}>
                      <td className="border border-gray-300 px-4 py-2">{item.itemName}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.itemsDetected}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.currentQuantity}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded ${
                          item.currentQuantity === 0 
                            ? "bg-red-100 text-red-800" 
                            : item.currentQuantity < item.quantity * 0.25 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-green-100 text-green-800"
                        }`}>
                          {item.currentQuantity === 0 
                            ? "Out of Stock" 
                            : item.currentQuantity < item.quantity * 0.25 
                              ? "Low Stock" 
                              : "In Stock"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-800">No inventory items to check against</p>
            )}
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Raw Text Detected</h3>
            <p className="text-gray-800 bg-gray-100 p-4 rounded">{results.text || "No text detected"}</p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Raw Response</h3>
            <details>
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Show raw JSON data</summary>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-64 text-gray-800 font-medium mt-2">
                {JSON.stringify(results, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}