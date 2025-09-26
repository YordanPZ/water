'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    FileText,
    CheckCircle2,
    AlertTriangle,
    Edit3,
    Save,
    X,
    Activity,
    Droplets,
    TestTube,
    Microscope,
} from 'lucide-react';

interface MeasurementMetadata {
    sampleDate: string;
    labName: string;
    technician: string;
    reportNumber: string;
    analysisDate: string;
    notes: string;
}

interface DetectedMeasurement {
    id: string;
    parameter: string;
    value: number | string;
    unit: string;
    limit: number;
    status: 'normal' | 'warning' | 'critical';
    confidence: number; // 0-100% confianza en la detección
    category: 'chemical' | 'bacteriological';
}

interface MeasurementReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (measurements: DetectedMeasurement[], metadata: MeasurementMetadata) => void;
    pdfFile: File | null;
    faucetId: string;
    faucetName: string;
}

export function MeasurementReviewModal({
    isOpen,
    onClose,
    onSave,
    pdfFile,
    faucetId,
    faucetName
}: MeasurementReviewModalProps) {
    const [detectedMeasurements, setDetectedMeasurements] = useState<DetectedMeasurement[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [metadata, setMetadata] = useState({
        sampleDate: new Date().toISOString().split('T')[0],
        labName: 'Laboratorio Central de Análisis',
        technician: 'Dr. María González',
        reportNumber: `RPT-${Date.now()}`,
        analysisDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    // Simular autodetección de valores del PDF
    useEffect(() => {
        if (isOpen && pdfFile) {
            simulateAutoDetection();
        }
    }, [isOpen, pdfFile]);

    const simulateAutoDetection = async () => {
        setIsProcessing(true);

        // Simular procesamiento del PDF
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Datos simulados de autodetección
        const mockDetectedValues: DetectedMeasurement[] = [
            // Parámetros químicos
            {
                id: 'ph',
                parameter: 'pH',
                value: 7.2,
                unit: 'unidades',
                limit: 8.5,
                status: 'normal',
                confidence: 95,
                category: 'chemical'
            },
            {
                id: 'turbidity',
                parameter: 'Turbiedad',
                value: 0.8,
                unit: 'NTU',
                limit: 2.0,
                status: 'normal',
                confidence: 92,
                category: 'chemical'
            },
            {
                id: 'free_chlorine',
                parameter: 'Cloro libre',
                value: 0.3,
                unit: 'mg/L',
                limit: 2.0,
                status: 'normal',
                confidence: 88,
                category: 'chemical'
            },
            {
                id: 'conductivity',
                parameter: 'Conductividad',
                value: 245,
                unit: 'µS/cm',
                limit: 1000,
                status: 'normal',
                confidence: 90,
                category: 'chemical'
            },
            {
                id: 'total_hardness',
                parameter: 'Dureza total',
                value: 120,
                unit: 'mg/L CaCO₃',
                limit: 300,
                status: 'normal',
                confidence: 85,
                category: 'chemical'
            },
            {
                id: 'tds',
                parameter: 'Sólidos disueltos totales',
                value: 180,
                unit: 'mg/L',
                limit: 500,
                status: 'normal',
                confidence: 87,
                category: 'chemical'
            },
            // Parámetros bacteriológicos
            {
                id: 'total_coliforms',
                parameter: 'Coliformes totales',
                value: 0,
                unit: 'UFC/100mL',
                limit: 0,
                status: 'normal',
                confidence: 98,
                category: 'bacteriological'
            },
            {
                id: 'fecal_coliforms',
                parameter: 'Coliformes fecales',
                value: 0,
                unit: 'UFC/100mL',
                limit: 0,
                status: 'normal',
                confidence: 98,
                category: 'bacteriological'
            },
            {
                id: 'ecoli',
                parameter: 'E. coli',
                value: 0,
                unit: 'UFC/100mL',
                limit: 0,
                status: 'normal',
                confidence: 96,
                category: 'bacteriological'
            },
            {
                id: 'enterococci',
                parameter: 'Enterococos',
                value: 0,
                unit: 'UFC/100mL',
                limit: 0,
                status: 'normal',
                confidence: 94,
                category: 'bacteriological'
            }
        ];

        setDetectedMeasurements(mockDetectedValues);
        setIsProcessing(false);
    };

    const handleEdit = (measurement: DetectedMeasurement) => {
        setEditingId(measurement.id);
        setEditValue(measurement.value.toString());
    };

    const handleSaveEdit = () => {
        if (editingId) {
            setDetectedMeasurements(prev =>
                prev.map(m =>
                    m.id === editingId
                        ? { ...m, value: parseFloat(editValue) || 0, confidence: 100 }
                        : m
                )
            );
            setEditingId(null);
            setEditValue('');
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditValue('');
    };

    const handleSaveMeasurements = async () => {
        setIsSaving(true);

        // Simular guardado
        await new Promise(resolve => setTimeout(resolve, 1500));

        onSave(detectedMeasurements, metadata);
        setIsSaving(false);
        onClose();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'normal': return 'bg-green-100 text-green-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'critical': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 90) return 'text-green-600';
        if (confidence >= 80) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Datos para gráficos
    const chemicalData = detectedMeasurements
        .filter(m => m.category === 'chemical')
        .map(m => ({
            name: m.parameter,
            value: typeof m.value === 'number' ? m.value : 0,
            limit: m.limit,
            percentage: typeof m.value === 'number' ? (m.value / m.limit) * 100 : 0
        }));

    const bacteriologicalData = detectedMeasurements
        .filter(m => m.category === 'bacteriological')
        .map(m => ({
            name: m.parameter,
            value: typeof m.value === 'number' ? m.value : 0,
            status: m.status
        }));

    const statusDistribution = [
        { name: 'Normal', value: detectedMeasurements.filter(m => m.status === 'normal').length, color: '#10b981' },
        { name: 'Advertencia', value: detectedMeasurements.filter(m => m.status === 'warning').length, color: '#f59e0b' },
        { name: 'Crítico', value: detectedMeasurements.filter(m => m.status === 'critical').length, color: '#ef4444' }
    ].filter(item => item.value > 0);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TestTube className="h-5 w-5" />
                        Revisión de Mediciones Detectadas
                    </DialogTitle>
                    <DialogDescription>
                        Revisa y edita los valores detectados automáticamente del PDF antes de guardar
                    </DialogDescription>
                </DialogHeader>

                {isProcessing ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-lg font-medium">Procesando PDF...</p>
                            <p className="text-sm text-gray-500">Detectando valores automáticamente</p>
                        </div>
                    </div>
                ) : (
                    <Tabs defaultValue="measurements" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="measurements">Mediciones</TabsTrigger>
                            <TabsTrigger value="charts">Gráficos</TabsTrigger>
                            <TabsTrigger value="summary">Resumen</TabsTrigger>
                            <TabsTrigger value="metadata">Metadatos</TabsTrigger>
                        </TabsList>

                        <TabsContent value="measurements" className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Parámetros Químicos */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Droplets className="h-4 w-4" />
                                            Parámetros Químicos
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {detectedMeasurements
                                            .filter(m => m.category === 'chemical')
                                            .map((measurement) => (
                                                <div key={measurement.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium">{measurement.parameter}</span>
                                                            <Badge className={getStatusColor(measurement.status)}>
                                                                {measurement.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                            {editingId === measurement.id ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        value={editValue}
                                                                        onChange={(e) => setEditValue(e.target.value)}
                                                                        className="w-20 h-8"
                                                                        type="number"
                                                                        step="0.01"
                                                                    />
                                                                    <span>{measurement.unit}</span>
                                                                    <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                                                                        <Save className="h-3 w-3" />
                                                                    </Button>
                                                                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <span className="font-mono">{measurement.value} {measurement.unit}</span>
                                                                    <span>Límite: {measurement.limit} {measurement.unit}</span>
                                                                    <span className={getConfidenceColor(measurement.confidence)}>
                                                                        {measurement.confidence}% confianza
                                                                    </span>
                                                                    <Button size="sm" variant="ghost" onClick={() => handleEdit(measurement)}>
                                                                        <Edit3 className="h-3 w-3" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </CardContent>
                                </Card>

                                {/* Parámetros Bacteriológicos */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Microscope className="h-4 w-4" />
                                            Parámetros Bacteriológicos
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {detectedMeasurements
                                            .filter(m => m.category === 'bacteriological')
                                            .map((measurement) => (
                                                <div key={measurement.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium">{measurement.parameter}</span>
                                                            <Badge className={getStatusColor(measurement.status)}>
                                                                {measurement.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                            {editingId === measurement.id ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        value={editValue}
                                                                        onChange={(e) => setEditValue(e.target.value)}
                                                                        className="w-20 h-8"
                                                                        type="number"
                                                                        step="1"
                                                                    />
                                                                    <span>{measurement.unit}</span>
                                                                    <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                                                                        <Save className="h-3 w-3" />
                                                                    </Button>
                                                                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <span className="font-mono">{measurement.value} {measurement.unit}</span>
                                                                    <span>Límite: {measurement.limit} {measurement.unit}</span>
                                                                    <span className={getConfidenceColor(measurement.confidence)}>
                                                                        {measurement.confidence}% confianza
                                                                    </span>
                                                                    <Button size="sm" variant="ghost" onClick={() => handleEdit(measurement)}>
                                                                        <Edit3 className="h-3 w-3" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="charts" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Gráfico de Parámetros Químicos */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Parámetros Químicos vs Límites</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={chemicalData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="value" fill="#3b82f6" name="Valor medido" />
                                                <Bar dataKey="limit" fill="#ef4444" name="Límite máximo" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Distribución de Estados */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Distribución de Estados</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={statusDistribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, value }) => `${name}: ${value}`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {statusDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="summary" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {detectedMeasurements.filter(m => m.status === 'normal').length}
                                                </p>
                                                <p className="text-sm text-gray-600">Parámetros normales</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                            <div>
                                                <p className="text-2xl font-bold text-yellow-600">
                                                    {detectedMeasurements.filter(m => m.status === 'warning').length}
                                                </p>
                                                <p className="text-sm text-gray-600">Advertencias</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-5 w-5 text-red-600" />
                                            <div>
                                                <p className="text-2xl font-bold text-red-600">
                                                    {detectedMeasurements.filter(m => m.status === 'critical').length}
                                                </p>
                                                <p className="text-sm text-gray-600">Críticos</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Resumen del Análisis</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Grifo:</span> {faucetName}
                                        </div>
                                        <div>
                                            <span className="font-medium">Fecha de muestra:</span> {metadata.sampleDate}
                                        </div>
                                        <div>
                                            <span className="font-medium">Laboratorio:</span> {metadata.labName}
                                        </div>
                                        <div>
                                            <span className="font-medium">Técnico:</span> {metadata.technician}
                                        </div>
                                        <div>
                                            <span className="font-medium">Número de reporte:</span> {metadata.reportNumber}
                                        </div>
                                        <div>
                                            <span className="font-medium">Total parámetros:</span> {detectedMeasurements.length}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h4 className="font-medium mb-2">Observaciones:</h4>
                                        <p className="text-sm text-gray-600">
                                            {detectedMeasurements.filter(m => m.status === 'critical').length > 0
                                                ? "Se detectaron parámetros críticos que requieren atención inmediata."
                                                : detectedMeasurements.filter(m => m.status === 'warning').length > 0
                                                    ? "Algunos parámetros están en estado de advertencia, se recomienda monitoreo."
                                                    : "Todos los parámetros están dentro de los límites normales."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="metadata" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información del Análisis</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="sampleDate">Fecha de muestra</Label>
                                            <Input
                                                id="sampleDate"
                                                type="date"
                                                value={metadata.sampleDate}
                                                onChange={(e) => setMetadata(prev => ({ ...prev, sampleDate: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="analysisDate">Fecha de análisis</Label>
                                            <Input
                                                id="analysisDate"
                                                type="date"
                                                value={metadata.analysisDate}
                                                onChange={(e) => setMetadata(prev => ({ ...prev, analysisDate: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="labName">Laboratorio</Label>
                                            <Input
                                                id="labName"
                                                value={metadata.labName}
                                                onChange={(e) => setMetadata(prev => ({ ...prev, labName: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="technician">Técnico responsable</Label>
                                            <Input
                                                id="technician"
                                                value={metadata.technician}
                                                onChange={(e) => setMetadata(prev => ({ ...prev, technician: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="reportNumber">Número de reporte</Label>
                                            <Input
                                                id="reportNumber"
                                                value={metadata.reportNumber}
                                                onChange={(e) => setMetadata(prev => ({ ...prev, reportNumber: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="notes">Notas adicionales</Label>
                                        <textarea
                                            id="notes"
                                            className="w-full mt-1 p-2 border rounded-md"
                                            rows={3}
                                            value={metadata.notes}
                                            onChange={(e) => setMetadata(prev => ({ ...prev, notes: e.target.value }))}
                                            placeholder="Observaciones adicionales sobre el análisis..."
                                        />
                                    </div>

                                    {pdfFile && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                <span className="text-sm font-medium">Archivo PDF:</span>
                                                <span className="text-sm text-gray-600">{pdfFile.name}</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveMeasurements} disabled={isProcessing || isSaving}>
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Guardar Mediciones
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}