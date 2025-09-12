
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PerfilComision, CreatePerfilComisionDTO } from '@/types/users';

interface CommissionProfileFormProps {
  perfil?: PerfilComision;
  onSubmit: (data: CreatePerfilComisionDTO) => void;
  onCancel: () => void;
}

export function CommissionProfileForm({ perfil, onSubmit, onCancel }: CommissionProfileFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    porcentajeTotal: 50,
    activo: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (perfil) {
      setFormData({
        nombre: perfil.nombre,
        descripcion: perfil.descripcion || '',
        porcentajeTotal: perfil.porcentajeTotal,
        activo: perfil.activo
      });
    }
  }, [perfil]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Nombre es obligatorio';
    }

    if (formData.porcentajeTotal < 0 || formData.porcentajeTotal > 100) {
      newErrors.porcentajeTotal = 'El porcentaje debe estar entre 0 y 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        porcentajeTotal: formData.porcentajeTotal,
        ...(perfil && { activo: formData.activo })
      };

      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre del Perfil *</Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          placeholder="Ej: Agente Senior, Agente Junior..."
        />
        {errors.nombre && <p className="text-sm text-red-600">{errors.nombre}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          placeholder="Descripción opcional del perfil..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="porcentajeTotal">Porcentaje Base (%)</Label>
        <Input
          id="porcentajeTotal"
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={formData.porcentajeTotal}
          onChange={(e) => setFormData({ ...formData, porcentajeTotal: parseFloat(e.target.value) || 0 })}
        />
        {errors.porcentajeTotal && <p className="text-sm text-red-600">{errors.porcentajeTotal}</p>}
        <p className="text-xs text-muted-foreground">
          Este es el porcentaje por defecto que se aplicará sobre la comisión principal del sistema
        </p>
      </div>

      {perfil && (
        <div className="flex items-center space-x-2">
          <Switch
            id="activo"
            checked={formData.activo}
            onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
          />
          <Label htmlFor="activo">Perfil activo</Label>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : (perfil ? 'Actualizar' : 'Crear Perfil')}
        </Button>
      </div>
    </form>
  );
}
