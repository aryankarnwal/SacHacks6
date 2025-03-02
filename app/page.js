import InventoryForm from '@/components/InventoryForm';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Fleet Inventory Setup</h1>
      <InventoryForm />
      <div className="mt-8">
        <Link 
          href="/image-upload" 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Go to Image Analysis
        </Link>
      </div>
    </main>

    
  );
}