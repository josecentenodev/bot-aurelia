import type { APIRoute } from 'astro';
import { OpenAI } from 'openai';
import Airtable from 'airtable';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
});

const base = new Airtable({ apiKey: import.meta.env.AIRTABLE_API_KEY }).base(import.meta.env.AIRTABLE_BASE_ID);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message, conversationId } = await request.json();
    console.log(message, conversationId);

    if (!message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No se proporcionó un mensaje',
        }),
        { status: 400 }
      );
    }

    // Store user message
    const userMessage = await base('Mensajes').create({
      ConvID: conversationId,
      Autor: 'user',
      Contenido: message,
      RoleOpenAI: 'user',
    });

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

    // Store assistant message
    const assistantMessage = await base('Mensajes').create({
      ConvId: conversationId,
      Autor: 'assistant',
      Contenido: response,
      RoleOpenAI: 'assistant',
      Tokens: completion.usage?.total_tokens,
      CostoUSD: completion.usage?.total_tokens ? (completion.usage.total_tokens * 0.000002) : 0 // Approximate cost for gpt-3.5-turbo
    });

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