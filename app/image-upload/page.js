// app/image-upload/page.js
import ImageUploadForm from '@/components/ImageUploadForm';

export default function ImageUploadPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Inventory Image Analysis</h1>
      <p className="text-lg mb-8 text-gray-700">
        Upload an image of a compartment (fire truck, ambulance, etc.) for automatic inventory analysis.
      </p>
      <ImageUploadForm />
    </main>
  );
}