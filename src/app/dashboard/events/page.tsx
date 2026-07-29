'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import ProtectedPage from '@/components/ProtectedPage'
import AppButton from '@/components/AppButton'
import ConfirmDialog from '@/components/ConfirmDialog'
import Spinner from '@/components/Spinner'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAllEvents, useCreateEvent, useDeleteEvent } from '@/hooks/useEvents'
import { useSchools } from '@/hooks/useSchools'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CalendarDays,
  Plus,
  Trash2,
  Flag,
  School,
  User,
} from 'lucide-react'

const eventSchema = z.object({
  title: z.string().min(2, 'Mínimo 2 caracteres'),
  description: z.string().optional(),
  date: z.string().min(1, 'Selecciona una fecha'),
  type: z.enum(['SCHOOL', 'NATIONAL_HOLIDAY', 'PERSONAL', 'OTHER']),
  schoolId: z.string().optional(),
})

type EventFormData = z.infer<typeof eventSchema>

const typeConfig = {
  NATIONAL_HOLIDAY: { color: 'var(--color-error)', bg: 'rgba(239, 68, 68, 0.1)', icon: Flag, label: 'Festivo' },
  SCHOOL: { color: 'var(--color-info)', bg: 'rgba(6, 182, 212, 0.1)', icon: School, label: 'Escolar' },
  PERSONAL: { color: 'var(--color-primary)', bg: 'rgba(37, 99, 235, 0.1)', icon: User, label: 'Personal' },
  OTHER: { color: 'var(--color-warning)', bg: 'rgba(245, 158, 11, 0.1)', icon: CalendarDays, label: 'Otro' },
}

export default function EventsPage() {
  usePageTitle('Eventos')

  const [selectedSchoolId, setSelectedSchoolId] = useState('')
  const [openEvent, setOpenEvent] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const { data: events, isLoading } = useAllEvents(selectedSchoolId || undefined)
  const { mutate: createEvent, isPending: isCreatingEvent } = useCreateEvent()
  const { mutate: deleteEvent } = useDeleteEvent()
  const { data: schools } = useSchools()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      type: 'PERSONAL',
      schoolId: '',
    },
  })

  const onSubmit = (data: EventFormData) => {
    createEvent(
      {
        title: data.title,
        description: data.description || undefined,
        date: data.date,
        type: data.type,
        schoolId: data.schoolId || undefined,
      },
      {
        onSuccess: () => {
          setOpenEvent(false)
          reset()
        },
      },
    )
  }

  return (
    <ProtectedPage>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-geist)',
            }}
          >
            Eventos
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {events?.length ?? 0} evento{events?.length !== 1 ? 's' : ''} registrado{events?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setOpenEvent(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors cursor-pointer"
          style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)'
          }}
        >
          <Plus size={16} />
          Nuevo evento
        </button>
      </div>

      {/* Filtro por escuela */}
      {schools && schools.length > 1 && (
        <select
          value={selectedSchoolId}
          onChange={e => setSelectedSchoolId(e.target.value)}
          className="w-full px-4 py-3 rounded-xl outline-none text-sm mb-6 cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: `1px solid ${selectedSchoolId ? 'var(--color-primary)' : 'var(--color-border)'}`,
            color: selectedSchoolId ? 'var(--color-text-primary)' : 'var(--color-text-disabled)',
          }}
        >
          <option value="">Todas las escuelas</option>
          {schools.map(school => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </select>
      )}

      {isLoading && <Spinner />}

      {/* Lista vacía */}
      {!isLoading && events?.length === 0 && (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-4"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Sin eventos registrados
          </p>
          <button
            onClick={() => setOpenEvent(true)}
            className="px-4 py-2 rounded-xl cursor-pointer"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          >
            Crear primer evento
          </button>
        </div>
      )}

      {/* Lista de eventos */}
      {!isLoading && events && events.length > 0 && (
        <div className="flex flex-col gap-3">
          {events.map(event => {
            const eventDate = new Date(event.date)
            const config = typeConfig[event.type]
            const Icon = config.icon
            const isPast = eventDate < new Date()

            return (
              <div
                key={event.id}
                className="flex items-center gap-4 px-4 py-3 rounded-2xl"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  opacity: isPast ? 0.6 : 1,
                }}
              >
                {/* Fecha */}
                <div
                  className="flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0"
                  style={{ backgroundColor: config.bg }}
                >
                  <span
                    className="text-lg font-semibold leading-none"
                    style={{ color: config.color, fontFamily: 'var(--font-geist)' }}
                  >
                    {eventDate.getDate()}
                  </span>
                  <span className="text-xs uppercase" style={{ color: config.color }}>
                    {eventDate.toLocaleDateString('es-MX', { month: 'short' })}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {event.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: config.bg, color: config.color }}
                    >
                      {config.label}
                    </span>
                    {event.schoolName && (
                      <span className="text-xs" style={{ color: 'var(--color-text-disabled)' }}>
                        {event.schoolName}
                      </span>
                    )}
                    {isPast && (
                      <span className="text-xs" style={{ color: 'var(--color-text-disabled)' }}>
                        Pasado
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p
                      className="text-xs mt-1 truncate"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {event.description}
                    </p>
                  )}
                </div>

                {/* Icono + eliminar */}
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: config.bg }}
                  >
                    <Icon size={14} style={{ color: config.color }} />
                  </div>
                  <button
                    onClick={() => setConfirmDeleteId(event.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                    style={{ color: 'var(--color-text-disabled)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = 'var(--color-error)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--color-text-disabled)'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal nuevo evento */}
      <Dialog
        open={openEvent}
        onOpenChange={(val) => { setOpenEvent(val); if (!val) reset() }}
      >
        <DialogContent
          style={{
            maxHeight: '90vh',
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            overflowY: 'scroll',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-geist)',
                textTransform: 'none',
              }}
            >
              Nuevo evento
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
            {/* Título */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Título
              </label>
              <input
                {...register('title')}
                placeholder="Ej. Entrega de boletas"
                className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: `1px solid ${errors.title ? 'var(--color-error)' : 'var(--color-border)'}`,
                  color: 'var(--color-text-primary)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = errors.title
                    ? 'var(--color-error)'
                    : 'var(--color-primary)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = errors.title
                    ? 'var(--color-error)'
                    : 'var(--color-border)'
                }}
              />
              {errors.title && (
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Fecha */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Fecha
              </label>
              <input
                {...register('date')}
                type="date"
                className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: `1px solid ${errors.date ? 'var(--color-error)' : 'var(--color-border)'}`,
                  color: 'var(--color-text-primary)',
                  colorScheme: 'dark',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = errors.date
                    ? 'var(--color-error)'
                    : 'var(--color-primary)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = errors.date
                    ? 'var(--color-error)'
                    : 'var(--color-border)'
                }}
              />
              {errors.date && (
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                  {errors.date.message}
                </p>
              )}
            </div>

            {/* Tipo */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Tipo
              </label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'PERSONAL', label: 'Personal' },
                      { value: 'SCHOOL', label: 'Escolar' },
                      { value: 'OTHER', label: 'Otro' },
                    ].map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => field.onChange(type.value)}
                        className="py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                        style={{
                          backgroundColor: field.value === type.value
                            ? 'var(--color-primary)'
                            : 'var(--color-bg-tertiary)',
                          border: `1px solid ${field.value === type.value
                            ? 'var(--color-primary)'
                            : 'var(--color-border)'}`,
                          color: field.value === type.value
                            ? 'white'
                            : 'var(--color-text-secondary)',
                        }}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Descripción (opcional)
              </label>
              <input
                {...register('description')}
                placeholder="Detalles del evento"
                className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
              />
            </div>

            {/* Escuela */}
            {schools && schools.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Escuela (opcional)
                </label>
                <select
                  {...register('schoolId')}
                  className="w-full px-4 py-3 rounded-xl outline-none text-sm cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <option value="">Sin escuela específica</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <AppButton isPending={isCreatingEvent} pendingLabel="Guardando..." fullWidth>
              Guardar evento
            </AppButton>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm eliminar */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={open => { if (!open) setConfirmDeleteId(null) }}
        title="Eliminar evento"
        description="¿Seguro que deseas eliminar este evento?"
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (confirmDeleteId) {
            deleteEvent(confirmDeleteId)
            setConfirmDeleteId(null)
          }
        }}
      />
    </ProtectedPage>
  )
}