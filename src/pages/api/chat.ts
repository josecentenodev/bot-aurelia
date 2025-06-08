import type { APIRoute } from 'astro';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message } = await request.json();

    if (!message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No se proporcionó un mensaje',
        }),
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres un asistente virtual amigable y servicial."
        },
        {
          role: "user",
          content: message
        }
      ],
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No se recibió respuesta del modelo');
    }

    return new Response(
      JSON.stringify({
        success: true,
        response,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en el endpoint de chat:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al procesar el mensaje',
      }),
      { status: 500 }
    );
  }
}; 