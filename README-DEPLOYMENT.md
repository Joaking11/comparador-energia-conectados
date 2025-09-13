
# 🚀 Guía de Despliegue - Conectados Consulting

## 📋 Aplicación de Comparativas de Energía

### 🎯 **Información del Despliegue:**
- **Dominio sugerido**: `comparativas.conectadosconsulting.es`  
- **Plataforma**: Vercel (recomendado para Next.js)
- **Estado**: ✅ Lista para desplegar

### 🏗️ **Configuración Requerida en Vercel:**

#### 1. **Variables de Entorno Obligatorias:**
```bash
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_SECRET=your-super-secret-32-char-string
NEXTAUTH_URL=https://comparativas.conectadosconsulting.es
NODE_ENV=production
```

#### 2. **Configuración de Base de Datos:**
- **PostgreSQL requerida** (compatible con Prisma)
- Opciones recomendadas:
  - **Vercel Postgres** (integrada)
  - **Supabase** (gratuito hasta 500MB)
  - **Railway** (fácil configuración)

#### 3. **Dominios:**
- Principal: `comparativas.conectadosconsulting.es`
- Alternativo: `comparativas-energia.conectadosconsulting.es`

### 🎨 **Branding Actualizado:**
- ✅ Título: "Conectados Consulting - Comparativas de Energía"
- ✅ Emails: `@conectadosconsulting.es`  
- ✅ Logo: Conectados Consulting
- ✅ Metadata actualizada

### 📊 **Funcionalidades Incluidas:**
- ✅ Comparativas automáticas de tarifas energéticas
- ✅ Administración de comercializadoras y ofertas  
- ✅ Sistema de comisiones granulares
- ✅ Importación inteligente de Excel
- ✅ Cálculos precisos de ahorros
- ✅ Informes profesionales en PDF
- ✅ Sistema completo de usuarios

### ⚠️ **Funcionalidades Temporalmente Deshabilitadas:**
- 🔄 Sistema de scraping automático (se puede habilitar después)

### 🚀 **Pasos para Desplegar:**

1. **Crear proyecto en Vercel:**
   - Ir a vercel.com → New Project
   - Importar este repositorio
   - Configurar variables de entorno

2. **Configurar base de datos:**
   - Crear BD PostgreSQL
   - Ejecutar migraciones: `yarn prisma db push`
   - Ejecutar seed inicial: `yarn prisma db seed`

3. **Configurar dominio:**
   - En Vercel: Settings → Domains
   - Agregar `comparativas.conectadosconsulting.es`
   - Configurar DNS en tu proveedor de dominio

4. **Verificar funcionamiento:**
   - Login: `admin@conectadosconsulting.es` / `admin123`
   - Crear primera comparativa
   - Verificar cálculos y comisiones

### 💡 **Post-Despliegue:**
- Los cambios futuros son **automáticos**
- Git push → Deploy automático en ~2-3 minutos
- Rollback instantáneo si hay problemas
- Logs y monitoring incluidos

### 📞 **Contacto Técnico:**
- Sistema desarrollado para Conectados Consulting
- Todas las funcionalidades probadas y operativas
- Backup completo disponible en caso de necesidad
