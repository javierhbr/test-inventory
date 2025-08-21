import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Upload, Download, X } from 'lucide-react';

interface Test {
  id: string;
  name: string;
  flow: string;
  labels: {
    flujo: string;
    intent: string;
    experience: string;
    proyecto: string;
  };
  dataRequirements: string[];
  supportedRuntimes: string[];
  lastExecution: any;
  lastModified: string;
  version: string;
}

interface CreateTestDialogProps {
  children: React.ReactNode;
  onTestCreated: (test: Test) => void;
}

const availableClassifications = [
  'Active account',
  'Business account',
  'Primary user',
  'Authorized user',
  'Expired account',
  'Expired credit card',
  'Inactive credit card',
  'Card with offer',
  'To activate'
];

const availableRuntimes = [
  'OCP Testing Studio',
  'Xero',
  'Sierra'
];

export function CreateTestDialog({ children, onTestCreated }: CreateTestDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('runtime');
  
  // Common form fields
  const [name, setName] = useState('');
  const [flow, setFlow] = useState('');
  const [goldenDialogId, setGoldenDialogId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [module, setModule] = useState('');
  
  // Labels
  const [labelFlujo, setLabelFlujo] = useState('');
  const [labelIntent, setLabelIntent] = useState('');
  const [labelExperience, setLabelExperience] = useState('');
  const [labelProyecto, setLabelProyecto] = useState('');
  
  // Data requirements and runtimes
  const [selectedClassifications, setSelectedClassifications] = useState<string[]>([]);
  const [selectedRuntimes, setSelectedRuntimes] = useState<string[]>([]);
  
  // Runtime tab specific
  const [dialogGroupId, setDialogGroupId] = useState('');
  const [selectedRuntime, setSelectedRuntime] = useState('');
  
  // Upload tab specific
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Golden Dialog ID file upload (optional)
  const [goldenDialogFile, setGoldenDialogFile] = useState<File | null>(null);

  const resetForm = () => {
    setName('');
    setFlow('');
    setGoldenDialogId('');
    setPriority('Medium');
    setModule('');
    setLabelFlujo('');
    setLabelIntent('');
    setLabelExperience('');
    setLabelProyecto('');
    setSelectedClassifications([]);
    setSelectedRuntimes([]);
    setDialogGroupId('');
    setSelectedRuntime('');
    setUploadedFile(null);
    setGoldenDialogFile(null);
    setActiveTab('runtime');
  };

  const handleClassificationChange = (classification: string, checked: boolean) => {
    if (checked) {
      setSelectedClassifications([...selectedClassifications, classification]);
    } else {
      setSelectedClassifications(selectedClassifications.filter(c => c !== classification));
    }
  };

  const handleRuntimeChange = (runtime: string, checked: boolean) => {
    if (checked) {
      setSelectedRuntimes([...selectedRuntimes, runtime]);
    } else {
      setSelectedRuntimes(selectedRuntimes.filter(r => r !== runtime));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleGoldenDialogFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/json' && !file.name.toLowerCase().endsWith('.json')) {
        alert('Please select a valid JSON file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Maximum 5MB allowed.');
        return;
      }
      
      setGoldenDialogFile(file);
    }
  };

  const generateTestId = () => {
    return `TC-${Date.now().toString().slice(-5)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !flow || !goldenDialogId || selectedClassifications.length === 0 || selectedRuntimes.length === 0) {
      alert('Please complete all required fields');
      return;
    }

    // Log information about optional golden dialog file
    if (goldenDialogFile) {
      console.log('Golden Dialog File uploaded:', {
        name: goldenDialogFile.name,
        size: goldenDialogFile.size,
        type: goldenDialogFile.type,
        lastModified: goldenDialogFile.lastModified
      });
      // Here you could read the file content and process it
      // const reader = new FileReader();
      // reader.onload = (e) => { ... };
      // reader.readAsText(goldenDialogFile);
    }

    const newTest: Test = {
      id: generateTestId(),
      name,
      flow,
      labels: {
        flujo: labelFlujo,
        intent: labelIntent,
        experience: labelExperience,
        proyecto: labelProyecto
      },
      dataRequirements: selectedClassifications,
      supportedRuntimes: selectedRuntimes,
      lastExecution: null,
      lastModified: new Date().toISOString(),
      version: 'v1.0'
    };

    onTestCreated(newTest);
    setOpen(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Test</DialogTitle>
          <DialogDescription>
            Create a new test case specifying its characteristics and requirements
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="runtime">By Runtime ID</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
            </TabsList>

            {/* Common Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Test Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g.: Expired card payment..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="goldenDialogId">Golden Dialog ID *</Label>
                  <Input
                    id="goldenDialogId"
                    value={goldenDialogId}
                    onChange={(e) => setGoldenDialogId(e.target.value)}
                    placeholder="E.g.: GD-001"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="flow">Flow Description *</Label>
                <Textarea
                  id="flow"
                  value={flow}
                  onChange={(e) => setFlow(e.target.value)}
                  placeholder="E.g.: Payment -> Validation -> Confirmation"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="module">Module</Label>
                  <Input
                    id="module"
                    value={module}
                    onChange={(e) => setModule(e.target.value)}
                    placeholder="E.g.: Payment, Login, etc."
                  />
                </div>
              </div>
            </div>

            <TabsContent value="runtime" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Runtime Configuration</CardTitle>
                  <CardDescription>
                    Specify Dialog Group ID and runtime to download the flow file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dialogGroupId">Dialog Group ID *</Label>
                      <Input
                        id="dialogGroupId"
                        value={dialogGroupId}
                        onChange={(e) => setDialogGroupId(e.target.value)}
                        placeholder="Dialog ID in the runtime"
                      />
                    </div>
                    <div>
                      <Label htmlFor="selectedRuntime">Runtime Source</Label>
                      <Select value={selectedRuntime} onValueChange={setSelectedRuntime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select runtime" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRuntimes.map(runtime => (
                            <SelectItem key={runtime} value={runtime}>
                              {runtime}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-md">
                    <strong>Process:</strong> The system will call the selected runtime API, 
                    download the flow file and automatically upload it to S3.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Manual Upload</CardTitle>
                  <CardDescription>
                    Directly upload the flow YAML/JSON file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".yaml,.yml,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600">
                        Click to select a YAML or JSON file
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Supported formats: .yaml, .yml, .json
                      </p>
                    </label>
                  </div>
                  {uploadedFile && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                      <span className="text-sm font-medium">{uploadedFile.name}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setUploadedFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Labels Section */}
            <Card>
              <CardHeader>
                <CardTitle>Labels</CardTitle>
                <CardDescription>Labels for classification and search</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="labelFlujo">Flow</Label>
                    <Input
                      id="labelFlujo"
                      value={labelFlujo}
                      onChange={(e) => setLabelFlujo(e.target.value)}
                      placeholder="E.g.: Payment, Login, Transfer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="labelIntent">Intent</Label>
                    <Select value={labelIntent} onValueChange={setLabelIntent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select intent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Positive">Positive</SelectItem>
                        <SelectItem value="Negative">Negative</SelectItem>
                        <SelectItem value="Edge Case">Edge Case</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="labelExperience">Experience</Label>
                    <Select value={labelExperience} onValueChange={setLabelExperience}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Web">Web</SelectItem>
                        <SelectItem value="Mobile">Mobile</SelectItem>
                        <SelectItem value="API">API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="labelProyecto">Project</Label>
                    <Input
                      id="labelProyecto"
                      value={labelProyecto}
                      onChange={(e) => setLabelProyecto(e.target.value)}
                      placeholder="E.g.: Release Q3, Core Banking"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Golden Dialog ID File Upload (Optional) */}
            <Card>
              <CardHeader>
                <CardTitle>Golden Dialog ID File (Optional)</CardTitle>
                <CardDescription>Upload a JSON file with the Golden Dialog ID definition</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleGoldenDialogFileUpload}
                    className="hidden"
                    id="golden-dialog-file-upload"
                  />
                  <label htmlFor="golden-dialog-file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to select a JSON file
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supported format: .json
                    </p>
                  </label>
                </div>
                {goldenDialogFile && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-800">{goldenDialogFile.name}</span>
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        {(goldenDialogFile.size / 1024).toFixed(1)} KB
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setGoldenDialogFile(null)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-md">
                  <strong>Note:</strong> This file is optional and should contain the JSON definition of the Golden Dialog ID. 
                  If not provided, only the ID specified above will be used.
                </div>
              </CardContent>
            </Card>

            {/* Data Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Data Requirements *</CardTitle>
                <CardDescription>Required test data classifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {availableClassifications.map((classification) => (
                    <div key={classification} className="flex items-center space-x-2">
                      <Checkbox
                        id={`class-${classification}`}
                        checked={selectedClassifications.includes(classification)}
                        onCheckedChange={(checked) => 
                          handleClassificationChange(classification, checked as boolean)
                        }
                      />
                      <Label htmlFor={`class-${classification}`} className="text-sm">
                        {classification}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedClassifications.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Selected:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedClassifications.map((classification) => (
                        <Badge key={classification} variant="secondary">
                          {classification}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supported Runtimes */}
            <Card>
              <CardHeader>
                <CardTitle>Supported Runtimes *</CardTitle>
                <CardDescription>Platforms where this test can be executed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableRuntimes.map((runtime) => (
                    <div key={runtime} className="flex items-center space-x-2">
                      <Checkbox
                        id={`runtime-${runtime}`}
                        checked={selectedRuntimes.includes(runtime)}
                        onCheckedChange={(checked) => 
                          handleRuntimeChange(runtime, checked as boolean)
                        }
                      />
                      <Label htmlFor={`runtime-${runtime}`} className="text-sm">
                        {runtime}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedRuntimes.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Selected:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRuntimes.map((runtime) => (
                        <Badge key={runtime} variant="outline">
                          {runtime}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4 pt-6">
              <Button type="submit" className="flex-1">
                Create Test
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
}