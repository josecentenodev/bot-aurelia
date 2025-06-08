import { z } from 'zod';

export const GetAirtableSchema = z.object({
	baseId: z.string(),
	tableId: z.string(),
	apiKey: z.string()
})

export enum Tono {
	Profesional = 'Profesional',
	Informal = 'Informal',
	Tecnico = 'Técnico',
	Cercano = 'Cercano',
	Empatico = 'Empático'
}

export const FormularioConfiguracionSchema = z.object({
	NombreAsistente: z.string().min(1, 'El nombre del asistente es requerido'),
	NombreEmpresa: z.string().min(1, 'El nombre de la empresa es requerido'),
	Tono: z.nativeEnum(Tono),
	DescripcionEmpresa: z.string().optional(),
	Sector: z.string().optional(),
	ClientesObjetivos: z.string().min(1, 'Los clientes objetivos son requeridos'),
	Personalidad: z.string().optional(),
	PreguntasCalificacion: z.string().optional(),
	PreguntasFrecuentes: z.string().optional(),
	EjemplosConversaciones: z.string().optional(),
	ManejoObjeciones: z.string().optional(),
	Objetivo: z.string().optional(),
	ProductosNoDisponibles: z.string().optional()
});

export const ConfiguracionAvanzadaSchema = z.object({
	Personalidad: z.string().min(1, 'La personalidad es requerida'),
	PreguntasCalificacion: z.string().min(1, 'Las preguntas de calificación son requeridas'),
	PreguntasFrecuentes: z.string().min(1, 'Las preguntas frecuentes son requeridas'),
	EjemplosConversaciones: z.string().min(1, 'Los ejemplos de conversaciones son requeridos'),
	ManejoObjeciones: z.string().min(1, 'El manejo de objeciones es requerido'),
	Objetivo: z.string().min(1, 'El objetivo es requerido')
});

export type GetAirtable = z.infer<typeof GetAirtableSchema>;
export type FormularioConfiguracion = z.infer<typeof FormularioConfiguracionSchema>;
export type ConfiguracionAvanzada = z.infer<typeof ConfiguracionAvanzadaSchema>;

export interface AirtableResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}
