import type { APIRoute } from 'astro';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: import.meta.env.AIRTABLE_API_KEY }).base(import.meta.env.AIRTABLE_BASE_ID);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { id, content, isPositive } = await request.json();

    console.log('Entrada POST en api/feedback:', id, content, isPositive);
    if (!id || !content) {
      return new Response(JSON.stringify({ success: false, error: 'Es necesario enviar un mensaje como feedback' }), { status: 400 });
    }

    
    // Save feedback to Airtable
    await base('Feedback').create({
      MsgId: [id],
      mensaje: content,
      Tipo: [`${isPositive ? 'Positivo' : 'Negativo'}`]
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('22: Error saving feedback: en api/feedback', error);
    return new Response(JSON.stringify({ success: false, error: 'Error al guardar el feedback' }), { status: 500 });
  }
}