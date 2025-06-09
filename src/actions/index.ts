import { defineAction } from 'astro:actions';
import { FormularioConfiguracionSchema, type FormularioConfiguracion, ConfiguracionAvanzada, ConfiguracionAvanzadaSchema } from '../types';
import { getAirtableData, updateAirtableData, enviarMensaje } from '../services';
import type { AirtableRecord } from '../types/airtable';
import { AirtableResponse } from '../types/airtable';

export const server = {
    obtenerDatosConfiguracion: defineAction({
        handler: async () => {
            try {
                const result = await getAirtableData('AsistentePorCliente');

                if (!result.success || !result.data) {
                    return {
                        success: false,
                        error: 'No se pudo obtener la configuración'
                    };
                }

                const airtableRecord = result.data as AirtableRecord;
                return { 
                    success: true, 
                    data: airtableRecord
                };
            } catch (error) {
                console.error('Error al obtener configuración:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Error al obtener configuración'
                };
            }
        }
    }),
    guardarCambiosConfiguracion: defineAction({
        accept: 'json',
        input: FormularioConfiguracionSchema,
        handler: async (input: { fields: FormularioConfiguracion }) => {
            try {
                console.log('Action received input:', input);
                const existingData = await getAirtableData('AsistentePorCliente');

                if (!existingData.success || !existingData.data) {
                    console.log('No existing configuration found');
                    return {
                        success: false,
                        error: 'No existe configuración para actualizar'
                    };
                }

                const airtableRecord = existingData.data as AirtableRecord;
                console.log('AIRTABLE RECORD', airtableRecord);
                if (!airtableRecord.id) {
                    console.error('No se encontró el ID del registro en Airtable');
                    return {
                        success: false,
                        error: 'No se encontró el ID del registro en Airtable'
                    };
                }

                console.log('Using record ID:', airtableRecord.id);

                // Procesar los datos para eliminar campos undefined y mantener solo los campos necesarios
                const processedData: FormularioConfiguracion = {
                    NombreAsistente: input.fields.NombreAsistente,
                    NombreEmpresa: input.fields.NombreEmpresa,
                    Tono: input.fields.Tono,
                    DescripcionEmpresa: input.fields.DescripcionEmpresa || '',
                    Sector: input.fields.Sector || '',
                    ClientesObjetivos: input.fields.ClientesObjetivos,
                    Personalidad: input.fields.Personalidad || '',
                    PreguntasCalificacion: input.fields.PreguntasCalificacion || '',
                    PreguntasFrecuentes: input.fields.PreguntasFrecuentes || '',
                    EjemplosConversaciones: input.fields.EjemplosConversaciones || '',
                    ManejoObjeciones: input.fields.ManejoObjeciones || '',
                    Objetivo: input.fields.Objetivo || '',
                    ProductosNoDisponibles: input.fields.ProductosNoDisponibles || ''
                };

                const result = await updateAirtableData(
                    'Asistente',
                    airtableRecord.id,
                    processedData
                );

                console.log('Update result:', result);

                if(result.success) {
                    return {
                        ...result,
                        message: 'Configuración actualizada correctamente',
                    };
                }
                return {
                    ...result,
                    message: 'Error al actualizar configuración',
                };
            } catch (error) {
                console.error('Error al actualizar configuración:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Error al actualizar configuración'
                };
            }
        }
    }),
    obtenerConfiguracionAvanzada: defineAction({
        handler: async () => {
            try {
                const result = await getAirtableData('ConfiguracionAvanzada');
                
                if (!result.success || !result.data) {
                    return {
                        success: false,
                        error: 'No se pudo obtener la configuración avanzada'
                    };
                }

                const airtableRecord = result.data as AirtableRecord;
                return { 
                    success: true, 
                    data: airtableRecord
                };
            } catch (error) {
                console.error('Error al obtener configuración avanzada:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Error al obtener configuración avanzada'
                };
            }
        }
    }),
    guardarConfiguracionAvanzada: defineAction({
        accept: 'form',
        input: ConfiguracionAvanzadaSchema,
        handler: async (input: { fields: ConfiguracionAvanzada }) => {
            try {
                // Intentar obtener el registro existente
                const existingData = await getAirtableData('ConfiguracionAvanzada');

                if (existingData.success && existingData.data) {
                    // Si existe, actualizar
                    const airtableRecord = existingData.data as AirtableRecord;
                    const result = await updateAirtableData(
                        'ConfiguracionAvanzada',
                        airtableRecord.id,
                        input.fields
                    );
                    return result;
                } 
            } catch (error) {
                console.error('Error al guardar configuración avanzada:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Error al guardar configuración avanzada'
                };
            }
        }
    })
}

export async function getAsistenteConfig() {
    try {
        const response = await getAirtableData('AsistentePorCliente');
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Error al obtener configuración del asistente');
        }
        return response;
    } catch (error) {
        console.error('Error en getAsistenteConfig:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al obtener configuración del asistente'
        };
    }
}

export async function updateAsistenteConfig(data: FormularioConfiguracion) {
    try {
        // Primero obtenemos el registro actual para asegurarnos de que existe
        const currentConfig = await getAirtableData('AsistentePorCliente');
        if (!currentConfig.success || !currentConfig.data) {
            throw new Error(currentConfig.error || 'No se encontró la configuración actual');
        }

        // Actualizamos el registro
        const response = await updateAirtableData('AsistentePorCliente', currentConfig.data.id, data);
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Error al actualizar la configuración');
        }

        return response;
    } catch (error) {
        console.error('Error en updateAsistenteConfig:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al actualizar la configuración'
        };
    }
}

export async function updateConfiguracionAvanzada(data: ConfiguracionAvanzada) {
    try {
        // Primero obtenemos el registro actual para asegurarnos de que existe
        const currentConfig = await getAirtableData('AsistentePorCliente');
        if (!currentConfig.success || !currentConfig.data) {
            throw new Error(currentConfig.error || 'No se encontró la configuración actual');
        }

        // Actualizamos el registro
        const response = await updateAirtableData('AsistentePorCliente', currentConfig.data.id, data);
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Error al actualizar la configuración avanzada');
        }

        return response;
    } catch (error) {
        console.error('Error en updateConfiguracionAvanzada:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al actualizar la configuración avanzada'
        };
    }
}

export async function enviarMensajeAction(mensaje: string) {
    try {
        const respuesta = await enviarMensaje(mensaje, 'AsistentePorCliente');
        return {
            success: true,
            data: respuesta
        };
    } catch (error) {
        console.error('Error en enviarMensajeAction:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al enviar mensaje'
        };
    }
}