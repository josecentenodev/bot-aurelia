import type { APIRoute } from 'astro';
import { OpenAI } from 'openai';
import Airtable from 'airtable';
import { getAsistente } from '../../services';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
});

const base = new Airtable({ apiKey: import.meta.env.AIRTABLE_API_KEY }).base(import.meta.env.AIRTABLE_BASE_ID);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message, conversationId } = await request.json();
    console.log('15: entrada POST en api/chat', message, conversationId);

    if (!message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No se proporcionó un mensaje en el cuerpo de la solicitud en api/chat',
        }),
        { status: 400 }
      );
    }

    // Store user message
    const userMessage = await base('Mensajes').create({
      ConvId: [conversationId],
      Autor: 'user',
      Contenido: message,
      RoleOpenAI: 'user',
    });
    const { success, data } = await getAsistente();
    console.log('35: Configuracion de Asistente:', data?.fields);
    if (!success || !data) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No se pudo obtener la configuración del asistente. Asegúrate de que el asistente esté configurado correctamente.',
      }),
        { status: 500 })
    }
    const systemPrompt = data.fields 
    && 'NombreAsistente' in data.fields 
    && data.fields.NombreEmpresa 
    && data.fields.Objetivo
      ? `Eres ${data.fields.NombreAsistente} y tu objetivo es ayudar a los usuarios a resolver sus dudas de la mejor manera posible.
      Tu tono es ${data.fields.Tono.toLowerCase()} y representas a la empresa ${data.fields.NombreEmpresa}.
      Descripción de la empresa: ${data.fields.DescripcionEmpresa || 'No se proporcionó una descripción.'}
      Objetivo: ${data.fields.Objetivo || 'No se proporcionó un objetivo.'}
      Sector: ${data.fields.Sector || 'No se proporcionó un sector.'}
      Clientes objetivos: ${data.fields.ClientesObjetivos || 'No se proporcionaron clientes objetivos.'}
      Personalidad: ${data.fields.Personalidad || 'No se proporcionó una personalidad.'}
      Preguntas frecuentes: ${data.fields.PreguntasFrecuentes || 'No se proporcionaron preguntas frecuentes.'}
      Ejemplos de conversaciones: ${data.fields.EjemplosConversaciones || 'No se proporcionaron ejemplos de conversaciones.'}
      Manejo de objeciones: ${data.fields.ManejoObjeciones || 'No se proporcionó información sobre el manejo de objeciones.'}
      Productos no disponibles y que no debes ofrecer: ${data.fields.ProductosNoDisponibles || 'No se proporcionó información sobre productos no disponibles.'}
      Preguntas de calificación para derivar con un asesor: ${data.fields.PreguntasCalificacion || 'No se proporcionaron preguntas de calificación.'}`
      : 'Eres un asistente virtual y tu objetivo es ayudar a los usuarios a resolver sus dudas de la mejor manera posible.';


    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('52: No se recibió respuesta del modelo en api/chat');
    }

    // Store assistant message
    const assistantMessage = await base('Mensajes').create({
      ConvId: [conversationId],
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
    console.error('73: Error en el endpoint de chat:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: '77: Error catch al procesar el mensaje en el endpoint de chat',
      }),
      { status: 500 }
    );
  }
}; 