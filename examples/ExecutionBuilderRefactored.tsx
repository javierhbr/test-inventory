// Example of how ExecutionBuilder would look after refactoring to use service layer
// This is a simplified version showing the pattern

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Upload, Search, Filter, ShoppingCart, Download, Plus, X, FileText, Copy, Trash2, AlertTriangle } from 'lucide-react';
import { useExecutionBuilder } from '../hooks';
import { generateExecutionYaml } from '../services';

export function ExecutionBuilderRefactored() {
  // All business logic is now in the custom hook
  const {
    // State
    tests,
    cart,
    filteredTests,
    isLoading,
    error,
    showValidationModal,
    showYamlDialog,
    showCsvDialog,
    csvInput,
    selectedRuntime,
    
    // Setters
    setSearchTerm,
    setFilterFlujo,
    setFilterRuntime,
    setSelectedRuntime,
    setCsvInput,
    setShowCsvDialog,
    setShowYamlDialog,
    setShowValidationModal,
    
    // Business logic
    handleAddToCart,
    handleRemoveFromCart,
    handleClearCart,
    handleAssignTestData,
    handleCsvImport,
    handleExportYaml,
    handleDownloadYaml,
    handleCopyYaml,
    clearFilters
  } = useExecutionBuilder();

  // Component only handles UI rendering
  return (
    <>
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Test Search and Filters */}
        <div className="col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Buscar Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o ID..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Select onValueChange={setFilterFlujo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Flujo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Login">Login</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                    <SelectItem value="Consulta">Consulta</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select onValueChange={setFilterRuntime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Runtime" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="OCP Testing Studio">OCP Testing Studio</SelectItem>
                    <SelectItem value="Xero">Xero</SelectItem>
                    <SelectItem value="Sierra">Sierra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Dialog open={showCsvDialog} onOpenChange={setShowCsvDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Upload className="w-4 h-4 mr-2" />
                      Import CSV
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Importar Tests desde CSV</DialogTitle>
                      <DialogDescription>
                        Pega tu CSV con testIds para agregar múltiples tests al cart
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Pega tu CSV aquí..."
                        value={csvInput}
                        onChange={(e) => setCsvInput(e.target.value)}
                        rows={8}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleCsvImport} className="flex-1" disabled={isLoading}>
                          {isLoading ? 'Importando...' : 'Importar'}
                        </Button>
                        <Button variant="outline" onClick={() => setShowCsvDialog(false)} className="flex-1">
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button size="sm" variant="outline" onClick={clearFilters}>
                  Limpiar
                </Button>
              </div>
              
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Tests */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Tests Disponibles ({filteredTests.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test</TableHead>
                      <TableHead>Labels</TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTests.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{test.id}</div>
                            <div className="text-xs text-gray-600 truncate" title={test.name}>
                              {test.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {test.labels.flujo}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {test.labels.experience}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(test)}
                            disabled={isLoading}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Cart and Execution */}
        <div className="col-span-7 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Execution Cart ({cart.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleClearCart}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpiar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay tests en el cart</p>
                  <p className="text-sm">Selecciona tests de la lista de la izquierda</p>
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test</TableHead>
                        <TableHead>Data Requirements</TableHead>
                        <TableHead>Assigned Test Data</TableHead>
                        <TableHead>Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.test.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{item.test.id}</div>
                              <div className="text-xs text-gray-600">{item.test.labels.flujo}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              {item.test.dataRequirements.slice(0, 2).join(', ')}
                              {item.test.dataRequirements.length > 2 && ' ...'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.assignedTestData ? (
                              <div className="text-xs">
                                <div className="font-mono">{item.assignedTestData.id}</div>
                                <div className="text-gray-500">{item.assignedTestData.referenceId}</div>
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  {item.assignedTestData.status}
                                </Badge>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">Not assigned</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveFromCart(item.test.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Execution Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Ejecución</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Runtime de Ejecución *</label>
                <Select value={selectedRuntime} onValueChange={setSelectedRuntime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona runtime para ejecutar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OCP Testing Studio">OCP Testing Studio</SelectItem>
                    <SelectItem value="Xero">Xero</SelectItem>
                    <SelectItem value="Sierra">Sierra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleAssignTestData} 
                  variant="outline"
                  disabled={cart.length === 0 || isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Asignando...' : 'Asignar Test Data Automáticamente'}
                </Button>
                <Button 
                  onClick={handleExportYaml}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export Execution YAML
                </Button>
              </div>

              {cart.length > 0 && selectedRuntime && (
                <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-md">
                  <strong>Resumen:</strong> {cart.length} tests seleccionados para ejecutar en {selectedRuntime}.
                  {cart.filter(item => item.assignedTestData).length > 0 && (
                    <div className="mt-1">
                      ✓ {cart.filter(item => item.assignedTestData).length} tests tienen test data asignado
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Validation Modal */}
      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center space-y-6 p-6">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-orange-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Selecciona al menos un test y un runtime
              </h3>
            </div>

            <Button 
              onClick={() => setShowValidationModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* YAML Export Dialog */}
      <Dialog open={showYamlDialog} onOpenChange={setShowYamlDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle>Execution YAML</DialogTitle>
                <DialogDescription>
                  YAML completo para ejecutar el lote de tests
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCopyYaml}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button size="sm" onClick={handleDownloadYaml}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div>
            <Textarea
              value={generateExecutionYaml({ cart, selectedRuntime })}
              readOnly
              className="font-mono text-sm min-h-[500px] resize-none"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}