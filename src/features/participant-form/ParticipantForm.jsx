import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Save, Plus, X, Camera, User, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input, Textarea, Select } from '@/shared/ui/Input';
import { Avatar } from '@/shared/ui/Avatar';
import { participantsRepository } from '@/storage/localStorageRepository';
import { storeImage, isImageIDBKey, deleteImage, getRawKey } from '@/storage/imageStorageService';
import { useResolvedImage } from '@/shared/hooks/useResolvedImage';
import { cn } from '@/shared/lib/cn';

export const PARTICIPANT_ROLES = [
  'Investigador',
  'Co-Investigador',
  'Investigador Principal',
  'Estudiante',
  'Docente',
  'Docente Investigador',
  'Ponente',
  'Director del Semillero',
  'Co-Director del Semillero',
  'Auxiliar de Investigación',
  'Colaborador Externo',
];

function PhotoUploadField({ participantId, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const resolvedUrl = useResolvedImage(value);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Solo se permiten imágenes JPG, PNG, WebP o GIF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar 5 MB.');
      return;
    }

    setUploading(true);
    try {
      const imageKey = `participant_${participantId || Date.now()}`;
      const idbKey = await storeImage(imageKey, file);
      onChange(idbKey);
    } catch (err) {
      console.error('Error al guardar imagen:', err);
      alert('No se pudo guardar la imagen.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (value && isImageIDBKey(value)) {
      await deleteImage(getRawKey(value)).catch(() => {});
    }
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">Foto de perfil</label>

      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-brand-50 border-2 border-brand-100 flex items-center justify-center">
            {resolvedUrl ? (
              <img src={resolvedUrl} alt="Vista previa" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-brand-200" />
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 rounded-2xl bg-white/80 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2 flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handleFileChange}
            disabled={uploading}
            id="photo-upload-input"
          />
          <label
            htmlFor="photo-upload-input"
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-medium',
              uploading
                ? 'opacity-50 cursor-not-allowed border-slate-200 text-slate-400'
                : 'border-brand-200 text-brand-700 bg-brand-50 hover:bg-brand-100 hover:border-brand-300'
            )}
          >
            <Camera size={15} />
            {resolvedUrl ? 'Cambiar foto' : 'Subir foto'}
          </label>

          {resolvedUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-100 text-red-500 bg-red-50 hover:bg-red-100 text-sm font-medium transition-colors"
            >
              <Trash2 size={14} />
              Eliminar foto
            </button>
          )}

          <p className="text-xs text-slate-400 leading-relaxed">
            JPG, PNG o WebP. Máx 5 MB.<br />
            La imagen se guarda en el navegador.
          </p>

          {value && isImageIDBKey(value) && (
            <div className="flex items-center gap-1.5 text-xs text-green-600">
              <CheckCircle size={12} />
              Guardada localmente
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SkillsField({ value, onChange }) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInput('');
    }
  };

  const remove = (skill) => onChange(value.filter((s) => s !== skill));

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">Habilidades / Tecnologías</label>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); add(); }
          }}
          placeholder="Ej: React, Docker, Python..."
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <Button type="button" variant="secondary" size="sm" onClick={add} icon={Plus}>
          Agregar
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-xs font-medium text-brand-700"
            >
              {skill}
              <button
                type="button"
                onClick={() => remove(skill)}
                className="text-brand-400 hover:text-brand-700 transition-colors"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ParticipantForm({ participant, onSuccess, onCancel }) {
  const isEdit = Boolean(participant?.id);
  const participantId = participant?.id ?? `new_${Date.now()}`;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      name: participant?.name ?? '',
      role: participant?.role ?? PARTICIPANT_ROLES[0],
      career: participant?.career ?? '',
      semester: participant?.semester ?? '',
      bio: participant?.bio ?? '',
      email: participant?.email ?? '',
      linkedin: participant?.linkedin ?? '',
      github: participant?.github ?? '',
      photo: participant?.photo ?? null,
    },
  });

  const photoValue = watch('photo');
  const [skills, setSkills] = useState(participant?.skills ?? []);

  const onSubmit = (data) => {
    const saved = {
      ...participant,
      ...data,
      skills,
      id: participant?.id ?? Date.now().toString(),
      manualsAsAuthor: participant?.manualsAsAuthor ?? [],
      manualsAsEditor: participant?.manualsAsEditor ?? null,
    };
    participantsRepository.save(saved);
    onSuccess?.(saved);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 p-6">
      {/* Photo */}
      <PhotoUploadField
        participantId={participantId}
        value={photoValue}
        onChange={(val) => setValue('photo', val, { shouldDirty: true })}
      />

      <div className="border-t border-slate-100" />

      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Nombre completo"
            placeholder="Nombre y apellidos"
            error={errors.name?.message}
            {...register('name', { required: 'El nombre es requerido' })}
          />
        </div>

        <Select label="Rol en el semillero" {...register('role')}>
          {PARTICIPANT_ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </Select>

        <Input
          label="Carrera / Programa"
          placeholder="Ej: Ingeniería de Software"
          {...register('career')}
        />

        <Input
          label="Semestre"
          placeholder="Ej: 6"
          {...register('semester')}
        />

        <Input
          label="Correo electrónico"
          type="email"
          placeholder="correo@universidad.edu"
          {...register('email')}
        />
      </div>

      {/* Bio */}
      <Textarea
        label="Descripción / Biografía"
        placeholder="Breve presentación del participante, áreas de interés, aportes al semillero..."
        rows={4}
        {...register('bio')}
      />

      {/* Skills */}
      <SkillsField value={skills} onChange={setSkills} />

      {/* Social */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="LinkedIn (URL)"
          placeholder="https://linkedin.com/in/..."
          {...register('linkedin')}
        />
        <Input
          label="GitHub (URL)"
          placeholder="https://github.com/..."
          {...register('github')}
        />
      </div>

      <div className="flex gap-3 pt-2 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} icon={Save} className="flex-1">
          {isEdit ? 'Guardar cambios' : 'Agregar participante'}
        </Button>
      </div>
    </form>
  );
}
