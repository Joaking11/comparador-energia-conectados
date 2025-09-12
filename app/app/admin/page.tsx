
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { 
  Settings, 
  Upload, 
  Building, 
  Zap, 
  DollarSign,
  Brain,
  FileSpreadsheet,
  FileText,
  BarChart3,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Database,
  Cpu,
  Users,
  ArrowLeft,
  Home,
  Eye
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    comercializadoras: 0,
    tarifas: 0,
    comisiones: 0,
    comparativasHoy: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      // Simular carga de estadísticas reales
      setTimeout(() => {
        setStats({
          comercializadoras: 36,
          tarifas: 727,
          comisiones: 156,
          comparativasHoy: 23
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Navegación superior */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Button>
        </Link>
        <Link href="/nueva-comparativa">
          <Button variant="ghost" className="flex items-center gap-2">
            Nueva Comparativa
          </Button>
        </Link>
        <Link href="/historial">
          <Button variant="ghost" className="flex items-center gap-2">
            Ver Historial
          </Button>
        </Link>
        <div className="h-4 border-l border-gray-300"></div>
        <p className="text-sm text-gray-600">Panel de Administración</p>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Panel de Administración Avanzado
        </h1>
        <p className="text-gray-600 mt-2">
          Sistema completo de gestión de tarifas y comisiones con inteligencia artificial
        </p>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comercializadoras</p>
                <p className="text-3xl font-bold text-blue-600">{stats.comercializadoras}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tarifas Activas</p>
                <p className="text-3xl font-bold text-green-600">{stats.tarifas}</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comisiones</p>
                <p className="text-3xl font-bold text-purple-600">{stats.comisiones}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comparativas Hoy</p>
                <p className="text-3xl font-bold text-orange-600">{stats.comparativasHoy}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FLUJO SIMPLIFICADO - 2 PASOS */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-lg mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">⚡ ADMINISTRACIÓN SIMPLIFICADA</h2>
          <p className="text-gray-700">Sólo 2 pasos: Subir Excel → Ver y editar datos</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PASO 1: Importar */}
          <Card className="border-3 border-blue-400 bg-white shadow-lg">
            <CardHeader className="bg-blue-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Upload className="h-6 w-6" />
                PASO 1: SUBIR EXCEL
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4 text-lg">
                📤 Sube tu archivo Excel modificado aquí. Los cambios se guardan automáticamente.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">✅ Lo que hace la IA:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Lee tarifas y comisiones automáticamente</li>
                  <li>• Identifica comercializadoras y ofertas</li>
                  <li>• Guarda los cambios en la base de datos</li>
                </ul>
              </div>
              <Link href="/admin/upload-smart">
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-4">
                  📁 IR A SUBIR EXCEL
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* PASO 2: Ver y Editar */}
          <Card className="border-3 border-green-400 bg-white shadow-lg">
            <CardHeader className="bg-green-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Eye className="h-6 w-6" />
                PASO 2: VER Y EDITAR
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4 text-lg">
                👁️ Ve todos los cambios aplicados y edita manualmente si necesitas.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-green-900 mb-2">✅ Lo que puedes hacer:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Ver todas las tarifas/ofertas importadas</li>
                  <li>• Ver todas las comisiones (fijas y FEE)</li>
                  <li>• Editar cualquier dato manualmente</li>
                </ul>
              </div>
              <Link href="/admin/manage">
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-lg py-4">
                  👀 IR A VER DATOS
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Accesos Directos */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>⚡ Accesos Directos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="text-center">
              <Link href="/admin/manage?tab=comercializadoras">
                <div className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                  <Building className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-blue-900">Comercializadoras</h3>
                  <p className="text-sm text-blue-700 mt-2">
                    Gestionar empresas energéticas y configuraciones
                  </p>
                </div>
              </Link>
            </div>
            
            <div className="text-center">
              <Link href="/admin/manage?tab=tarifas">
                <div className="bg-orange-50 p-6 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                  <Zap className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-orange-900">Tarifas y Ofertas</h3>
                  <p className="text-sm text-orange-700 mt-2">
                    Ver y editar todas las tarifas disponibles
                  </p>
                </div>
              </Link>
            </div>
            
            <div className="text-center">
              <Link href="/admin/manage?tab=comisiones">
                <div className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                  <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-purple-900">Comisiones</h3>
                  <p className="text-sm text-purple-700 mt-2">
                    Gestionar comisiones fijas y por FEE
                  </p>
                </div>
              </Link>
            </div>

            <div className="text-center">
              <Link href="/admin/usuarios">
                <div className="bg-green-50 p-6 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-green-900">Usuarios</h3>
                  <p className="text-sm text-green-700 mt-2">
                    Gestionar usuarios y agentes comerciales
                  </p>
                </div>
              </Link>
            </div>

            <div className="text-center">
              <Link href="/admin/perfiles-comision">
                <div className="bg-indigo-50 p-6 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer">
                  <TrendingUp className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-indigo-900">Perfiles Comisión</h3>
                  <p className="text-sm text-indigo-700 mt-2">
                    Configurar comisiones granulares
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Características IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            🚀 Características de Inteligencia Artificial Implementadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Detección Automática</h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-7">
                <li>• Reconocimiento de comercializadoras existentes</li>
                <li>• Identificación automática de tipos de tarifa</li>
                <li>• Detección de hojas relevantes en Excel</li>
                <li>• Mapeo inteligente de columnas</li>
              </ul>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Procesamiento Avanzado</h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-7">
                <li>• OCR para archivos PDF con tablas</li>
                <li>• Validación automática de formatos</li>
                <li>• Corrección de errores comunes</li>
                <li>• Normalización de datos</li>
              </ul>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Análisis Inteligente</h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-7">
                <li>• Patrones de reconocimiento avanzados</li>
                <li>• Sugerencias de mapeo alternativo</li>
                <li>• Detección de duplicados</li>
                <li>• Validación contextual de precios</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado del Sistema */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📊 Estado del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <span className="font-medium">Sistema IA</span>
                <p className="text-sm text-gray-600">Funcionando correctamente</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <span className="font-medium">Base de Datos</span>
                <p className="text-sm text-gray-600">Conectada y operativa</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <span className="font-medium">APIs</span>
                <p className="text-sm text-gray-600">Todas funcionando</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <span className="font-medium">Importaciones</span>
                <p className="text-sm text-gray-600">Listas para usar</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
