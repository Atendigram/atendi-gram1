import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Sprout, 
  CloudRain, 
  Sun,
  Droplet,
  Wind,
  ArrowRight,
  Calendar,
  Wallet,
  Trash2,
  Plus,
  X,
  Check,
  Edit
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import GuadeloupeWeatherAlerts from './GuadeloupeWeatherAlerts';
import { EditableField } from './ui/editable-field';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import PageHeader from './layout/PageHeader';

// Sample data for charts - Adapté pour la Guadeloupe
const revenueData = [
  { month: 'Jan', revenue: 1500 },
  { month: 'Fév', revenue: 2200 },
  { month: 'Mar', revenue: 2500 },
  { month: 'Avr', revenue: 2800 },
  { month: 'Mai', revenue: 3200 },
  { month: 'Juin', revenue: 3500 },
  { month: 'Juil', revenue: 4000 },
];

const productionData = [
  { name: 'Canne à Sucre', value: 40 },
  { name: 'Banane', value: 25 },
  { name: 'Ananas', value: 15 },
  { name: 'Igname', value: 10 },
  { name: 'Autre', value: 10 },
];

// Task list adapté au contexte guadeloupéen
const initialUpcomingTasks = [
  { id: 1, title: 'Récolter la canne à sucre', due: 'Aujourd\'hui', priority: 'high' },
  { id: 2, title: 'Commander des plants de bananier', due: 'Demain', priority: 'medium' },
  { id: 3, title: 'Maintenance du tracteur', due: '28/08', priority: 'low' },
  { id: 4, title: 'Irrigation des plantations d\'ananas', due: '30/08', priority: 'medium' },
];

// Alerts pour les agriculteurs en Guadeloupe
const initialAlerts = [
  { id: 1, message: 'Niveau bas de plants de bananier', type: 'warning' },
  { id: 2, message: 'Risque cyclonique pour la semaine prochaine', type: 'danger' },
  { id: 3, message: 'Échéance de subvention régionale approche', type: 'info' },
];

// Weather alerts data
const initialWeatherAlerts = [
  { 
    id: 1, 
    type: 'Cyclone', 
    region: 'Toute la Guadeloupe', 
    startDate: '2023-09-10', 
    endDate: '2023-09-12', 
    severity: 'critique', 
    description: 'Cyclone tropical de catégorie 2 en approche' 
  },
  { 
    id: 2, 
    type: 'Pluie', 
    region: 'Basse-Terre', 
    startDate: '2023-09-20', 
    endDate: '2023-09-23', 
    severity: 'modérée', 
    description: 'Fortes précipitations attendues' 
  }
];

const Dashboard = () => {
  // State for editable content
  const [title, setTitle] = useState('Olá, Atendente');
  const [description, setDescription] = useState('Aqui está uma visão geral do seu atendimento no AtendiGram');
  const [currentMonth, setCurrentMonth] = useState('Août 2023');
  
  // Stats cards
  const [monthlyRevenue, setMonthlyRevenue] = useState(15450);
  const [revenueGrowth, setRevenueGrowth] = useState(8.5);
  const [cultivatedArea, setCultivatedArea] = useState(35);
  const [parcelsCount, setParcelsCount] = useState(5);
  const [averageYield, setAverageYield] = useState(75);
  const [yieldGrowth, setYieldGrowth] = useState(5.2);
  const [alertsCount, setAlertsCount] = useState(3);
  
  // Tasks and alerts
  const [upcomingTasks, setUpcomingTasks] = useState(initialUpcomingTasks);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [weatherAlerts, setWeatherAlerts] = useState(initialWeatherAlerts);
  
  // New alert dialog
  const [showAddAlertDialog, setShowAddAlertDialog] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'Cyclone',
    region: '',
    startDate: '',
    endDate: '',
    severity: 'modérée',
    description: ''
  });
  
  // Task editing state
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState('');
  
  // Handle changes
  const handleTitleChange = (value: string | number) => {
    setTitle(String(value));
    toast.success('Titre mis à jour');
  };
  
  const handleDescriptionChange = (value: string | number) => {
    setDescription(String(value));
    toast.success('Description mise à jour');
  };
  
  const handleMonthChange = (value: string | number) => {
    setCurrentMonth(String(value));
    toast.success('Mois mis à jour');
  };
  
  // Stat card updates
  const handleRevenueChange = (value: string | number) => {
    setMonthlyRevenue(Number(value));
    toast.success('Revenu mensuel mis à jour');
  };
  
  const handleRevenueGrowthChange = (value: string | number) => {
    setRevenueGrowth(Number(value));
    toast.success('Croissance du revenu mise à jour');
  };
  
  const handleAreaChange = (value: string | number) => {
    setCultivatedArea(Number(value));
    toast.success('Superficie cultivée mise à jour');
  };
  
  const handleParcelsCountChange = (value: string | number) => {
    setParcelsCount(Number(value));
    toast.success('Nombre de parcelles mis à jour');
  };
  
  const handleYieldChange = (value: string | number) => {
    setAverageYield(Number(value));
    toast.success('Rendement moyen mis à jour');
  };
  
  const handleYieldGrowthChange = (value: string | number) => {
    setYieldGrowth(Number(value));
    toast.success('Croissance du rendement mise à jour');
  };
  
  // Task management
  const handleEditTask = (taskId: number) => {
    const task = upcomingTasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(taskId);
      setEditedTaskTitle(task.title);
    }
  };
  
  const handleSaveTask = (taskId: number) => {
    if (editedTaskTitle.trim() === '') return;
    
    setUpcomingTasks(upcomingTasks.map(task => 
      task.id === taskId ? { ...task, title: editedTaskTitle } : task
    ));
    setEditingTask(null);
    toast.success('Tâche mise à jour');
  };
  
  const handleDeleteTask = (taskId: number) => {
    setUpcomingTasks(upcomingTasks.filter(task => task.id !== taskId));
    toast.success('Tâche supprimée');
  };
  
  // Alert management
  const handleEditAlert = (id: number, message: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, message } : alert
    ));
    toast.success('Alerte mise à jour');
  };
  
  const handleDeleteAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    setAlertsCount(prev => prev - 1);
    toast.success('Alerte supprimée');
  };
  
  // Weather alert management
  const handleDeleteWeatherAlert = (id: number) => {
    setWeatherAlerts(weatherAlerts.filter(alert => alert.id !== id));
    toast.success('Alerte météorologique supprimée');
  };
  
  const handleAddWeatherAlert = () => {
    // Validation
    if (!newAlert.region || !newAlert.startDate || !newAlert.endDate || !newAlert.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    const newId = Math.max(...weatherAlerts.map(a => a.id), 0) + 1;
    const alertToAdd = {
      id: newId,
      ...newAlert
    };
    
    setWeatherAlerts([...weatherAlerts, alertToAdd]);
    setShowAddAlertDialog(false);
    setNewAlert({
      type: 'Cyclone',
      region: '',
      startDate: '',
      endDate: '',
      severity: 'modérée',
      description: ''
    });
    
    toast.success('Nouvelle alerte météorologique ajoutée');
  };
  
  // Add transaction handler (placeholder for future implementation)
  const handleAddTransaction = () => {
    toast.info('Redirection vers la page de finances');
    // In a real app, this would navigate to the finance page
  };
  
  return (
    <div className="p-6 space-y-6 animate-enter">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            <EditableField
              value={title}
              onSave={handleTitleChange}
              className="inline-block"
              showEditIcon={true}
            />
          </h1>
          <p className="text-muted-foreground">
            <EditableField
              value={description}
              onSave={handleDescriptionChange}
              className="inline-block"
              showEditIcon={true}
            />
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 text-sm text-agri-primary font-medium bg-agri-primary/10 rounded-lg hover:bg-agri-primary/20 transition-colors">
            <Calendar className="h-4 w-4 inline mr-2" />
            <EditableField
              value={currentMonth}
              onSave={handleMonthChange}
              className="inline-block"
            />
          </button>
          <button 
            className="px-4 py-2 text-sm bg-agri-primary text-white rounded-lg hover:bg-agri-primary-dark transition-colors"
            onClick={handleAddTransaction}
          >
            <Wallet className="h-4 w-4 inline mr-2" />
            Ajouter une transaction
          </button>
        </div>
      </header>

      {/* Quick Stats Row - Adapté à l'agriculture guadeloupéenne */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card card-hover">
          <p className="stat-label">Revenu mensuel</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">
              <EditableField
                value={monthlyRevenue}
                type="number"
                onSave={handleRevenueChange}
                className="inline-block font-bold"
              /> €
            </p>
            <span className="text-agri-success text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> +
              <EditableField
                value={revenueGrowth}
                type="number"
                onSave={handleRevenueGrowthChange}
                className="inline-block"
              />%
            </span>
          </div>
        </div>
        
        <div className="stat-card card-hover">
          <p className="stat-label">Superficie cultivée</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">
              <EditableField
                value={cultivatedArea}
                type="number"
                onSave={handleAreaChange}
                className="inline-block font-bold"
              /> ha
            </p>
            <span className="text-agri-primary text-sm font-medium">
              <EditableField
                value={parcelsCount}
                type="number"
                onSave={handleParcelsCountChange}
                className="inline-block"
              /> parcelles
            </span>
          </div>
        </div>
        
        <div className="stat-card card-hover">
          <p className="stat-label">Rendement moyen</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">
              <EditableField
                value={averageYield}
                type="number"
                onSave={handleYieldChange}
                className="inline-block font-bold"
              /> t/ha
            </p>
            <span className="text-agri-success text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> +
              <EditableField
                value={yieldGrowth}
                type="number"
                onSave={handleYieldGrowthChange}
                className="inline-block"
              />%
            </span>
          </div>
        </div>
        
        <div className="stat-card card-hover">
          <p className="stat-label">Alertes</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{alertsCount}</p>
            <span className="text-agri-warning text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" /> Récent
            </span>
          </div>
        </div>
      </div>

      {/* Weather alerts section */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Alertes Météorologiques</h2>
          <Button 
            onClick={() => setShowAddAlertDialog(true)}
            className="bg-agri-primary hover:bg-agri-primary-dark"
          >
            <Plus size={16} className="mr-2" /> Ajouter une alerte
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">
          Suivez les alertes météorologiques impactant l'agriculture en Guadeloupe
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Région</th>
                <th className="px-4 py-3 text-left">Période</th>
                <th className="px-4 py-3 text-left">Sévérité</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* ...resto igual... */}
