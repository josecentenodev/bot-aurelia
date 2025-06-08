import Airtable from 'airtable';
import { ConfiguracionAvanzada, FormularioConfiguracion } from "../types";

// Configuración global de Airtable
Airtable.configure({
    apiKey: import.meta.env.AIRTABLE_API_KEY
});

const base = Airtable.base(import.meta.env.AIRTABLE_BASE_ID);

interface AirtableRecord {
    id: string;
    fields: Record<string, any>;
}

export async function getAirtableData(tableId: string) {
    try {
        const records = (await base(tableId).select().firstPage()) as unknown as AirtableRecord[];
        
        if (!records || records.length === 0) {
            return { 
                success: false, 
                error: 'No se encontraron registros' 
            };
        }

        return { 
            success: true, 
            data: records[0].fields 
        };
    } catch (error) {
        console.error('Error detallado al cargar datos desde Airtable:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Error al cargar datos'
        };
    }
}

export async function saveAirtableData(tableId: string, data: FormularioConfiguracion | ConfiguracionAvanzada) {
    try {
        const record = await base(tableId).create([
            { fields: data }
        ]);

        return { 
            success: true, 
            data: record[0].fields 
        };
    } catch (error) {
        console.error('Error detallado al guardar configuración en Airtable:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Error al guardar datos'
        };
    }
}

export async function updateAirtableData(tableId: string, recordId: string, data: FormularioConfiguracion | ConfiguracionAvanzada) {
    try {
        const record = await base(tableId).update([
            { id: recordId, fields: data }
        ]);

        return { 
            success: true, 
            data: record[0].fields 
        };
    } catch (error) {
        console.error('Error detallado al actualizar configuración en Airtable:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Error al actualizar datos'
        };
    }
}

export async function enviarMensaje(mensaje: string, tableId: string) {
    try {
        // Obtener la configuración del asistente desde Airtable
        const configRecord = await base(tableId).select().firstPage();
        
        if (!configRecord || configRecord.length === 0) {
            throw new Error('No se encontró configuración del asistente');
        }

        const config = configRecord[0].fields;
        const nombreAsistente = config.NombreAsistente || 'Asistente';

        // Obtener el modelo desde OpenAI usando el nombre del asistente
        const assistantsResponse = await fetch('https://api.openai.com/v1/assistants', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
            }
        });

        if (!assistantsResponse.ok) {
            const errorData = await assistantsResponse.json();
            throw new Error(`Error al obtener asistentes: ${errorData.error?.message || assistantsResponse.statusText}`);
        }

        const assistantsData = await assistantsResponse.json();
        console.log('Asistentes disponibles:', assistantsData);

        const assistant = assistantsData.data.find((a: any) => a.name === nombreAsistente);
        
        if (!assistant) {
            throw new Error(`No se encontró el asistente "${nombreAsistente}" en OpenAI. Asistentes disponibles: ${assistantsData.data.map((a: any) => a.name).join(', ')}`);
        }

        // Crear un thread para la conversación
        const threadResponse = await fetch('https://api.openai.com/v1/threads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
            }
        });

        if (!threadResponse.ok) {
            throw new Error('Error al crear el thread de conversación');
        }

        const thread = await threadResponse.json();

        // Agregar el mensaje al thread
        await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify({
                role: 'user',
                content: mensaje
            })
        });

        // Ejecutar el asistente
        const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify({
                assistant_id: assistant.id
            })
        });

        if (!runResponse.ok) {
            throw new Error('Error al ejecutar el asistente');
        }

        const run = await runResponse.json();

        // Esperar a que el run se complete
        let runStatus;
        do {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const statusResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
                headers: {
                    'Authorization': `Bearer ${import.meta.env.OPENAI_API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2'
                }
            });
            const statusData = await statusResponse.json();
            runStatus = statusData.status;
        } while (runStatus === 'in_progress' || runStatus === 'queued');

        if (runStatus !== 'completed') {
            throw new Error(`El run no se completó correctamente. Estado: ${runStatus}`);
        }

        // Obtener los mensajes del thread
        const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
            headers: {
                'Authorization': `Bearer ${import.meta.env.OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
            }
        });

        if (!messagesResponse.ok) {
            throw new Error('Error al obtener los mensajes del thread');
        }

        const messagesData = await messagesResponse.json();
        const assistantMessage = messagesData.data.find((m: any) => m.role === 'assistant');
        
        if (assistantMessage) {
            return assistantMessage.content[0].text.value;
        } else {
            throw new Error('No se encontró la respuesta del asistente');
        }

    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        throw error;
    }
}