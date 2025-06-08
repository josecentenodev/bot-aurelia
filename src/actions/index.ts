import { defineAction } from 'astro:actions';
import { FormularioConfiguracionSchema, type FormularioConfiguracion, ConfiguracionAvanzada, ConfiguracionAvanzadaSchema } from '../types';
import { getAirtableData, saveAirtableData, updateAirtableData } from '../services';


export const server = {
    obtenerDatosConfiguracion: defineAction({
        handler: async () => {
            const result = await getAirtableData(import.meta.env.AIRTABLE_TABLE_ID);
            
            if (!result.success) {
                return result;
            }

            return { 
                success: true, 
                data: result.data as FormularioConfiguracion
            };
        }
    }),
    guardarCambiosConfiguracion: defineAction({
        accept: 'form',
        input: FormularioConfiguracionSchema,
        handler: async (input: FormularioConfiguracion) => {
            try {
                // Intentar obtener el registro existente
                const existingData = await getAirtableData(import.meta.env.AIRTABLE_TABLE_ID);

                if (existingData.success && existingData.data) {
                    // Si existe, actualizar
                    const result = await updateAirtableData(
                        import.meta.env.AIRTABLE_TABLE_ID,
                        existingData.data.id,
                        input
                    );
                    return result;
                } else {
                    // Si no existe, crear nuevo
                    const result = await saveAirtableData(
                        import.meta.env.AIRTABLE_TABLE_ID,
                        input
                    );
                    return result;
                }
            } catch (error) {
                console.error('Error al guardar configuración:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Error al guardar configuración'
                };
            }
        }
    }),
    obtenerConfiguracionAvanzada: defineAction({
        handler: async () => {
            const result = await getAirtableData(import.meta.env.AIRTABLE_ADVANCED_CONFIG_TABLE_ID);
            return { 
                success: true, 
                data: result.data as ConfiguracionAvanzada 
            };
        }
    }),
    guardarConfiguracionAvanzada: defineAction({
        accept: 'form',
        input: ConfiguracionAvanzadaSchema,
        handler: async (input: ConfiguracionAvanzada) => {
            try {
                // Intentar obtener el registro existente
                const existingData = await getAirtableData(import.meta.env.AIRTABLE_ADVANCED_CONFIG_TABLE_ID);

                if (existingData.success && existingData.data) {
                    // Si existe, actualizar
                    const result = await updateAirtableData(
                        import.meta.env.AIRTABLE_ADVANCED_CONFIG_TABLE_ID,
                        existingData.data.id,
                        input
                    );
                    return result;
                } else {
                    // Si no existe, crear nuevo
                    const result = await saveAirtableData(
                        import.meta.env.AIRTABLE_ADVANCED_CONFIG_TABLE_ID,
                        input
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