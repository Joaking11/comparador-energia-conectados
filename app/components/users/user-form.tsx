
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { User, PerfilComision, CreateUserDTO, UpdateUserDTO } from '@/types/users';

interface UserFormProps {
  user?: User;
  perfiles: PerfilComision[];
  onSubmit: (data: CreateUserDTO | UpdateUserDTO) => void;
  onCancel: () => void;
}

export function UserForm({ user, perfiles, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    tipoUsuario: 'regular' as 'regular' | 'agente_con_login' | 'agente_sin_login' | 'admin',
    perfilComisionId: '',
    telefono: '',
    observaciones: '',
    activo: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email,
        username: user.username || '',
        password: '',
        confirmPassword: '',
        tipoUsuario: user.tipoUsuario,
        perfilComisionId: user.perfilComisionId || '',
        telefono: user.telefono || '',
        observaciones: user.observaciones || '',
        activo: user.activo
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email no válido';
    }

    if (!formData.tipoUsuario) {
      newErrors.tipoUsuario = 'Tipo de usuario es obligatorio';
    }

    // Validar password solo si se está creando usuario o si se proporciona una nueva password
    if (!user && !formData.password) {
      newErrors.password = 'Contraseña es obligatoria para usuarios nuevos';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar que agentes con login tengan username y password
    if (formData.tipoUsuario === 'agente_con_login' || formData.tipoUsuario === 'admin') {
      if (!formData.username) {
        newErrors.username = 'Nombre de usuario es obligatorio para este tipo de usuario';
      }
      
      if (!user && !formData.password) {
        newErrors.password = 'Contraseña es obligatoria para este tipo de usuario';
      }
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
      const submitData: any = {
        name: formData.name || null,
        email: formData.email,
        tipoUsuario: formData.tipoUsuario,
        perfilComisionId: formData.perfilComisionId || null,
        telefono: formData.telefono || null,
        observaciones: formData.observaciones || null
      };

      // Solo incluir username si no está vacío
      if (formData.username) {
        submitData.username = formData.username;
      }

      // Solo incluir password si se proporciona
      if (formData.password) {
        submitData.password = formData.password;
      }

      // Para actualizaciones, incluir el estado activo
      if (user) {
        submitData.activo = formData.activo;
      }

      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  const tiposUsuario = [
    { value: 'regular', label: 'Usuario Regular' },
    { value: 'agente_con_login', label: 'Agente con Login' },
    { value: 'agente_sin_login', label: 'Agente sin Login' },
    { value: 'admin', label: 'Administrador' }
  ];

  const perfilesActivos = perfiles.filter(p => p.activo);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Información Personal */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nombre del usuario"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@ejemplo.com"
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Nombre de usuario</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="nombreusuario"
          />
          {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            placeholder="+34 123 456 789"
          />
        </div>
      </div>

      {/* Contraseñas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">
            {user ? 'Nueva contraseña (opcional)' : 'Contraseña *'}
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={user ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
          />
          {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Repetir contraseña"
            disabled={!formData.password}
          />
          {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>
      </div>

      {/* Configuración */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo de Usuario *</Label>
          <Select 
            value={formData.tipoUsuario} 
            onValueChange={(value: any) => setFormData({ ...formData, tipoUsuario: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {tiposUsuario.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tipoUsuario && <p className="text-sm text-red-600">{errors.tipoUsuario}</p>}
        </div>

        <div className="space-y-2">
          <Label>Perfil de Comisión</Label>
          <Select 
            value={formData.perfilComisionId} 
            onValueChange={(value) => setFormData({ ...formData, perfilComisionId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin perfil asignado</SelectItem>
              {perfilesActivos.map((perfil) => (
                <SelectItem key={perfil.id} value={perfil.id}>
                  {perfil.nombre} ({perfil.porcentajeTotal}%)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estado (solo para edición) */}
      {user && (
        <div className="flex items-center space-x-2">
          <Switch
            id="activo"
            checked={formData.activo}
            onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
          />
          <Label htmlFor="activo">Usuario activo</Label>
        </div>
      )}

      {/* Observaciones */}
      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          value={formData.observaciones}
          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
          placeholder="Notas adicionales sobre el usuario..."
          rows={3}
        />
      </div>

      {/* Información sobre tipos de usuario */}
      <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
        <p className="font-medium mb-2">Tipos de usuario:</p>
        <ul className="space-y-1 text-xs">
          <li><strong>Usuario Regular:</strong> Acceso básico al sistema</li>
          <li><strong>Agente con Login:</strong> Puede acceder al sistema y ver sus comisiones</li>
          <li><strong>Agente sin Login:</strong> Aparece en reportes pero no accede al sistema</li>
          <li><strong>Administrador:</strong> Acceso completo a la administración</li>
        </ul>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : (user ? 'Actualizar' : 'Crear Usuario')}
        </Button>
      </div>
    </form>
  );
}
