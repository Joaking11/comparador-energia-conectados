
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  Zap, 
  FileText, 
  PlusCircle,
  Building,
  Target
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalComparativos: number;
  totalComercializadoras: number;
  totalOfertas: number;
  ahorroPromedio: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalComparativos: 0,
    totalComercializadoras: 0,
    totalOfertas: 0,
    ahorroPromedio: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      title: 'Nueva Comparativa',
      description: 'Crear una nueva comparativa de ofertas energéticas',
      icon: Calculator,
      href: '/nueva-comparativa',
      color: 'bg-blue-500'
    },
    {
      title: 'Historial',
      description: 'Ver comparativas anteriores y resultados',
      icon: FileText,
      href: '/historial',
      color: 'bg-green-500'
    },
    {
      title: 'Comercializadoras',
      description: 'Gestionar ofertas y comercializadoras',
      icon: Building,
      href: '/comercializadoras',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Comparativas de <span className="text-blue-600">Energía</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Herramienta profesional para consultores energéticos. 
          Compare ofertas, calcule ahorros y comisiones de forma automática.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Comparativas
            </CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {loading ? '--' : stats.totalComparativos}
            </div>
            <p className="text-xs text-gray-500">Total realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Comercializadoras
            </CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {loading ? '--' : stats.totalComercializadoras}
            </div>
            <p className="text-xs text-gray-500">Disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ofertas
            </CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {loading ? '--' : stats.totalOfertas}
            </div>
            <p className="text-xs text-gray-500">En el catálogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ahorro Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {loading ? '--' : `${stats.ahorroPromedio.toFixed(0)}€`}
            </div>
            <p className="text-xs text-gray-500">Por comparativa</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <Link href={feature.href}>
                <CardHeader>
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Acceder
                  </Button>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>

      {/* Quick Start */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Zap className="h-5 w-5 mr-2" />
            Inicio Rápido
          </CardTitle>
          <CardDescription className="text-blue-700">
            ¿Nuevo en la plataforma? Sigue estos pasos para realizar tu primera comparativa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="text-sm text-gray-700">Crear nueva comparativa</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-sm text-gray-700">Introducir datos del cliente</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="text-sm text-gray-700">Ver resultados y comisiones</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-blue-200">
            <Link href="/nueva-comparativa">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Calculator className="h-4 w-4 mr-2" />
                Comenzar Primera Comparativa
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
