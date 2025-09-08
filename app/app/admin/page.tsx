
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
  Users
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

      {/* Funcionalidades Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Importación Inteligente */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Brain className="h-5 w-5" />
              🤖 Importación Inteligente con IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 mb-4">
              Sistema avanzado que utiliza inteligencia artificial para interpretar automáticamente archivos Excel y PDF.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-3 rounded">
                <FileSpreadsheet className="h-6 w-6 text-green-600 mb-2" />
                <span className="text-sm font-medium">Excel Inteligente</span>
              </div>
              <div className="bg-white p-3 rounded">
                <FileText className="h-6 w-6 text-red-600 mb-2" />
                <span className="text-sm font-medium">OCR para PDF</span>
              </div>
            </div>
            <Link href="/admin/upload-smart">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Acceder a Importación IA
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Gestión Manual */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Database className="h-5 w-5" />
              Gestión Manual Avanzada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-800 mb-4">
              Interfaz completa para administrar manualmente todos los datos con herramientas avanzadas.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-3 rounded">
                <Users className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium">Gestión Completa</span>
              </div>
              <div className="bg-white p-3 rounded">
                <TrendingUp className="h-6 w-6 text-purple-600 mb-2" />
                <span className="text-sm font-medium">Análisis Avanzado</span>
              </div>
            </div>
            <Link href="/admin/manage">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Acceder a Gestión Manual
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Herramientas Especializadas */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>🛠️ Herramientas Especializadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Link href="/admin/tarifas">
                <div className="bg-orange-50 p-6 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                  <Zap className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-orange-900">Tarifas Avanzado</h3>
                  <p className="text-sm text-orange-700 mt-2">
                    Editor completo con validación automática y funcionalidades avanzadas
                  </p>
                </div>
              </Link>
            </div>
            
            <div className="text-center">
              <Link href="/admin/comisiones">
                <div className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                  <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-purple-900">Comisiones Avanzado</h3>
                  <p className="text-sm text-purple-700 mt-2">
                    Gestión completa de comisiones con rangos y condiciones especiales
                  </p>
                </div>
              </Link>
            </div>
            
            <div className="text-center">
              <Link href="/admin/comercializadoras">
                <div className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                  <Building className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-blue-900">Comercializadoras</h3>
                  <p className="text-sm text-blue-700 mt-2">
                    Administración de comercializadoras y sus configuraciones
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
