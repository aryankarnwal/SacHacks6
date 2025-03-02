// app/api/vision-analysis/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse the FormData
    const formData = await request.formData();
    const imageFile = formData.get('image');
    
    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }
    
    // Convert the file to a base64 string
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64Image = buffer.toString('base64');
    
    // Call the Vision API using the API key
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image
              },
              features: [
                { type: 'LABEL_DETECTION', maxResults: 10 },
                { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
                { type: 'TEXT_DETECTION' }
              ]
            }
          ]
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vision API error:', errorText);
      throw new Error(`Vision API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    // Extract and format results
    const results = {
      labels: data.responses[0].labelAnnotations || [],
      objects: data.responses[0].localizedObjectAnnotations || [],
      text: data.responses[0].textAnnotations?.length > 0 
        ? data.responses[0].textAnnotations[0].description 
        : ''
    };
    
    return NextResponse.json({ 
      success: true, 
      results 
    });
    
  } catch (error) {
    console.error('Vision API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process image' },
      { status: 500 }
    );
  }
}