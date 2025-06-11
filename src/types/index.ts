import { z } from 'zod';


export interface AirtableResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}

export interface MessageFromAirtable {
	MsgId: number;
	ConvId: string[];
	Autor: string;
	Contenido: string;
	RoleOpenAI: 'user' | 'assistant';
	FechaHora: string;
	id?: string;
}


export interface Message {
	id?: string;
	role: 'user' | 'assistant';
	content: string;
	hora?: string;
}

export enum Tono {
	Profesional = 'Profesional',
	Informal = 'Informal',
	Tecnico = 'Técnico',
	Cercano = 'Cercano',
	Empatico = 'Empático'
}

export const FormularioConfiguracionSchema = z.object({
	fields: z.object({
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
	})
});

export const ConfiguracionAvanzadaSchema = z.object({
	fields: z.object({
		TiempoRespuesta: z.number().min(1, 'El tiempo de respuesta es requerido'),
		Recontactos: z.number().min(1, 'El número de recontactos es requerido'),
		TiempoRecontacto: z.number().min(1, 'El tiempo de recontacto es requerido')
	})
});

export type FormularioConfiguracion = z.infer<typeof FormularioConfiguracionSchema>['fields'];
export type ConfiguracionAvanzada = z.infer<typeof ConfiguracionAvanzadaSchema>['fields'];
