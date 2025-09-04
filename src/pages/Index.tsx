import React, { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import Dashboard from '../components/Dashboard';
import TabContainer, { TabItem } from '../components/layout/TabContainer';
import GuadeloupeHarvestTracking from '../components/GuadeloupeHarvestTracking';
import GuadeloupeWeatherAlerts from '../components/GuadeloupeWeatherAlerts';
import TaskList from '../components/cultures/TaskList';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download, Filter, RefreshCw, Upload, Printer } from 'lucide-react';
import { StatisticsProvider } from '../contexts/StatisticsContext';
import { useCRM } from '../contexts/CRMContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
const Index = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userName, setUserName] = useState('Atendente');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Contexto CRM
  const {
    lastSync,
    isRefreshing,
    syncDataAcrossCRM,
    exportModuleData,
    importModuleData,
    printModuleData
  } = useCRM();

  // Ações por aba
  const getTabActions = () => {
    switch (activeTab) {
      case 'dashboard':
        return <div className="flex flex-wrap gap-3">
            
            
            
            
          </div>;
      case 'harvest':
        return <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50" onClick={() => handleExportData('harvest')}>
              <Download className="h-4 w-4 text-gray-600" />
              Exportar
            </Button>
            <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50" onClick={() => handlePrintData('harvest')}>
              <Printer className="h-4 w-4 text-gray-600" />
              Imprimir
            </Button>
          </div>;
      case 'weather':
        return <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50" onClick={() => handleExportData('weather')}>
              <Download className="h-4 w-4 text-gray-600" />
              Exportar
            </Button>
            <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50">
              <Filter className="h-4 w-4 text-gray-600" />
              Configurar
            </Button>
          </div>;
      case 'tasks':
        return <div className="flex flex-wrap gap-3">
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white">
              <PlusCircle className="h-4 w-4" />
              Adicionar
            </Button>
            <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50" onClick={() => handleExportData('tasks')}>
              <Download className="h-4 w-4 text-gray-600" />
              Exportar
            </Button>
            <Button variant="outline" className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50" onClick={() => handlePrintData('tasks')}>
              <Printer className="h-4 w-4 text-gray-600" />
              Imprimir
            </Button>
          </div>;
      default:
        return null;
    }
  };
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    console.log(`Mudança de aba para: ${value}`);
  };

  // Exportação / Importação / Impressão
  const handleExportData = async (tab: string) => {
    const moduleMapping: {
      [key: string]: string;
    } = {
      dashboard: 'statistiques',
      harvest: 'cultures',
      weather: 'statistiques',
      tasks: 'cultures'
    };
    const module = moduleMapping[tab] || 'statistiques';
    const format = tab === 'dashboard' ? 'excel' : 'csv';
    try {
      await exportModuleData(module, format as 'csv' | 'excel' | 'pdf');
      console.log(`Export de ${module} no formato ${format} iniciado`);
    } catch (error) {
      console.error(`Erro exportando ${module}:`, error);
    }
  };
  const handleImportData = () => setImportDialogOpen(true);
  const handleImportConfirm = async () => {
    if (!selectedFile) {
      console.error('Nenhum arquivo selecionado');
      return;
    }
    const moduleMapping = {
      dashboard: 'statistiques',
      harvest: 'cultures',
      weather: 'statistiques',
      tasks: 'cultures'
    };
    const module = moduleMapping[activeTab] || 'statistiques';
    try {
      await importModuleData(module, selectedFile);
      console.log(`Importação do arquivo ${selectedFile.name} concluída`);
    } catch (error) {
      console.error(`Erro importando ${module}:`, error);
    }
    setImportDialogOpen(false);
    setSelectedFile(null);
  };
  const handlePrintData = async (tab: string) => {
    const moduleMapping = {
      dashboard: 'statistiques',
      harvest: 'cultures',
      weather: 'statistiques',
      tasks: 'cultures'
    };
    const module = moduleMapping[tab] || 'statistiques';
    try {
      await printModuleData(module);
      console.log(`Impressão de ${module} iniciada`);
    } catch (error) {
      console.error(`Erro imprimindo ${module}:`, error);
    }
  };
  const tabs: TabItem[] = [{
    value: 'dashboard',
    label: 'Dashboard',
    content: <Dashboard />
  }, {
    value: 'harvest',
    label: 'Telegram',
    content: <GuadeloupeHarvestTracking />
  }, {
    value: 'weather',
    label: 'Mensagens',
    content: <GuadeloupeWeatherAlerts />
  }, {
    value: 'tasks',
    label: 'Tarefas',
    content: <TaskList />
  }];
  return <StatisticsProvider>
      <PageLayout>
        <div className="p-6 animate-enter">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">📊Painel AtendiGram</h1>
              
            </div>
            {getTabActions()}
          </div>

          <TabContainer tabs={tabs} defaultValue={activeTab} onValueChange={handleTabChange} />

          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Importar dados</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Arquivo CSV</Label>
                  <input type="file" id="file" accept=".csv" onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} className="w-full border border-input bg-background px-3 py-2 text-sm rounded-md" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Os dados serão importados para o módulo atual. Certifique-se de que o arquivo está no formato CSV.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleImportConfirm}>Importar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageLayout>
    </StatisticsProvider>;
};
export default Index;