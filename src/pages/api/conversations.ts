import type { APIRoute } from 'astro';
import Airtable from 'airtable';
import { MessageFromAirtable } from '../../types';

const base = new Airtable({ apiKey: import.meta.env.AIRTABLE_API_KEY }).base(import.meta.env.AIRTABLE_BASE_ID);

export const GET: APIRoute = async ({ request }) => {
  try {
    const locationId = import.meta.env.LOCATION_ID;
    
    // Get the latest conversation for this location
    const conversations = await base('Conversaciones')
      .select({
        filterByFormula: `{locationId} = '${locationId}'`,
        sort: [{ field: 'FechaInicio', direction: 'desc' }],
        maxRecords: 1
      })
      .firstPage();

    if (conversations.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          conversation: null,
          messages: []
        }),
        { status: 200 }
      );
    }

    const conversation = conversations[0];
    
    
    // Get all messages for this conversation
    const messages = await base('Mensajes')
      .select({
        filterByFormula: `{ConvId} = '${conversation.fields.ConvId}'`,
        sort: [{ field: 'FechaHora', direction: 'asc' }]
      })
      .all();

    return new Response(
      JSON.stringify({
        success: true,
        conversation: {
          id: conversation.id,
          ...conversation.fields
        },
        messages: messages.map(msg => ({
          id: msg.id,
          ...msg.fields as unknown as MessageFromAirtable,
        }))
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al obtener la conversación:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al obtener la conversación'
      }),
      { status: 500 }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const locationId = import.meta.env.LOCATION_ID;
    
    // Create new conversation
    const conversation = await base('Conversaciones').create({
      ClienteID: locationId,
      Canal: 'Playground',
      Estado: 'en curso',
      FechaInicio: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({
        success: true,
        conversationId: conversation.id
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al crear la conversación:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al crear la conversación'
      }),
      { status: 500 }
    );
  }
}; 