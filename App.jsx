import React, { useState, useEffect, createContext, useContext } from 'react';
import { Heart } from 'lucide-react';

// Contexte Supabase
const SupabaseContext = createContext();

const SupabaseProvider = ({ children, supabaseUrl, supabaseKey }) => {
  const value = { supabaseUrl, supabaseKey };
  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
};

const useSupabase = () => useContext(SupabaseContext);

// Fonction utilitaire pour appels Supabase
const supabaseCall = async (supabaseUrl, supabaseKey, method, table, data = null, filter = null) => {
  const url = new URL(`${supabaseUrl}/rest/v1/${table}`, supabaseUrl);
  
  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      url.searchParams.append(key, `eq.${value}`);
    });
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: data ? JSON.stringify(data) : null,
  });

  return response.json();
};

// Composant Login
const LoginScreen = ({ onLogin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const CORRECT_CODE = '2024AMIES'; // Code partagé

  const handleLogin = () => {
    if (code === CORRECT_CODE) {
      onLogin();
    } else {
      setError('Code incorrect 🔐');
      setCode('');
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-pink-100 to-purple-200">
      <div className="text-center">
        <h1 className="text-5xl mb-2">🎮✨</h1>
        <h2 className="text-3xl font-bold text-purple-700 mb-2">Séjour Magique</h2>
        <p className="text-purple-600 mb-8">Entre amies</p>
        
        <input
          type="password"
          placeholder="Code d'accès"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          className="w-64 px-4 py-3 rounded-lg border-2 border-purple-300 focus:outline-none focus:border-pink-400 text-center text-xl font-bold tracking-wider"
        />
        
        <button
          onClick={handleLogin}
          className="mt-4 w-64 px-6 py-3 bg-gradient-to-r from-blue-300 to-pink-300 text-white font-bold rounded-lg hover:from-blue-400 hover:to-pink-400 transition"
        >
          Entrer 🚪
        </button>
        
        {error && <p className="text-red-500 font-bold mt-4">{error}</p>}
      </div>
    </div>
  );
};

// Onglet: Planning 📅
const PlanningTab = () => {
  const [activities, setActivities] = useState([
    { id: 1, day: 'Jour 1', activity: 'Arrivée & Installation', time: '14:00', location: 'Maison', meals: '🍽️ Dîner', checklist: ['Bagages', 'Clés'] },
    { id: 2, day: 'Jour 2', activity: 'Randonnée', time: '09:00', location: 'Montagne', meals: '🥐 Petit-déj + 🍽️ Déjeuner', checklist: ['Chaussures', 'Eau', 'Sun screen'] },
  ]);
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-2xl font-bold text-purple-700 mb-4">📅 Planning du séjour</h2>
      {activities.map((act) => (
        <div key={act.id} className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4 border-2 border-blue-300">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpanded(expanded === act.id ? null : act.id)}>
            <div>
              <h3 className="font-bold text-lg text-purple-700">{act.day}</h3>
              <p className="text-blue-600">{act.activity}</p>
              <p className="text-sm text-gray-600">⏰ {act.time}</p>
            </div>
            <span className="text-2xl">{expanded === act.id ? '▼' : '▶'}</span>
          </div>
          
          {expanded === act.id && (
            <div className="mt-4 pt-4 border-t-2 border-blue-300 space-y-2">
              <p className="text-sm"><strong>📍 Lieu:</strong> {act.location}</p>
              <p className="text-sm"><strong>{act.meals}</strong></p>
              <div className="text-sm"><strong>✓ Checklist:</strong>
                <ul className="ml-4 mt-1">
                  {act.checklist.map((item, i) => (
                    <li key={i}>☐ {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Onglet: Jeux & Défis 🎲
const GamesTab = () => {
  const [dailyChallenge, setDailyChallenge] = useState('🤸 Faire 10 burpees sans s\'arrêter !');
  const [choreChallenge, setChoreChallenge] = useState({ task: 'Faire la vaisselle', person: 'Marie' });
  
  const challenges = [
    '🤸 Faire 10 burpees sans s\'arrêter !',
    '🎤 Chanter une chanson en entier',
    '💃 Danser sur une chanson aléatoire',
    '🧘 Faire 5 minutes de yoga',
    '📸 Prendre une selfie absurde',
    '🎯 Lancer des dés et faire des points',
  ];

  const chores = [
    'Faire la vaisselle',
    'Ranger la cuisine',
    'Nettoyer la salle de bain',
    'Balayer le salon',
    'Faire les lits',
  ];

  const friends = ['Marie', 'Sophie', 'Alice', 'Julie', 'Emma'];

  const rollChallenge = () => {
    setDailyChallenge(challenges[Math.floor(Math.random() * challenges.length)]);
  };

  const rollChore = () => {
    setChoreChallenge({
      task: chores[Math.floor(Math.random() * chores.length)],
      person: friends[Math.floor(Math.random() * friends.length)],
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold text-purple-700 mb-4">🎲 Jeux & Défis</h2>
      
      {/* Défi du jour */}
      <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg p-6 border-3 border-yellow-300">
        <h3 className="font-bold text-lg text-orange-700 mb-2">🌟 Défi du jour</h3>
        <p className="text-2xl font-bold text-orange-600 mb-4">{dailyChallenge}</p>
        <button
          onClick={rollChallenge}
          className="w-full py-3 bg-gradient-to-r from-yellow-300 to-orange-300 text-white font-bold rounded-lg hover:from-yellow-400 hover:to-orange-400 transition"
        >
          🎲 Nouveau Défi
        </button>
      </div>

      {/* Loto Corvées */}
      <div className="bg-gradient-to-br from-pink-100 to-red-100 rounded-lg p-6 border-3 border-pink-300">
        <h3 className="font-bold text-lg text-red-700 mb-2">🧹 Loto Corvées</h3>
        <div className="bg-white rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600">Tâche:</p>
          <p className="text-xl font-bold text-red-600">{choreChallenge.task}</p>
          <p className="text-sm text-gray-600 mt-2">Responsable:</p>
          <p className="text-xl font-bold text-pink-600">{choreChallenge.person}</p>
        </div>
        <button
          onClick={rollChore}
          className="w-full py-3 bg-gradient-to-r from-pink-300 to-red-300 text-white font-bold rounded-lg hover:from-pink-400 hover:to-red-400 transition"
        >
          🎯 Tirer une corvée
        </button>
      </div>
    </div>
  );
};

// Onglet: Repas & Courses 🍽️
const MealsTab = () => {
  const [meals, setMeals] = useState([
    { id: 1, type: '🥐 Petit-déj', day: 'Jour 1', responsible: 'Sophie', items: ['Oeufs', 'Pain', 'Confiture'] },
    { id: 2, type: '🍽️ Déjeuner', day: 'Jour 1', responsible: 'Marie', items: ['Pâtes', 'Sauce', 'Fromage'] },
  ]);

  const [shoppingList, setShoppingList] = useState([
    { id: 1, item: 'Lait', done: false },
    { id: 2, item: 'Pain', done: false },
    { id: 3, item: 'Fromage', done: true },
  ]);

  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim()) {
      setShoppingList([...shoppingList, { id: Date.now(), item: newItem, done: false }]);
      setNewItem('');
    }
  };

  const toggleItem = (id) => {
    setShoppingList(shoppingList.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold text-purple-700 mb-4">🍽️ Repas & Courses</h2>

      {/* Repas */}
      <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 border-2 border-green-300">
        <h3 className="font-bold text-lg text-green-700 mb-3">Repas prévus</h3>
        {meals.map((meal) => (
          <div key={meal.id} className="bg-white rounded-lg p-3 mb-2">
            <p className="font-bold text-green-600">{meal.type}</p>
            <p className="text-sm text-gray-600">{meal.day} - Responsable: {meal.responsible}</p>
            <p className="text-xs text-gray-500">Items: {meal.items.join(', ')}</p>
          </div>
        ))}
      </div>

      {/* Liste de courses */}
      <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-4 border-2 border-blue-300">
        <h3 className="font-bold text-lg text-blue-700 mb-3">🛒 Liste de courses</h3>
        <div className="space-y-2 mb-4">
          {shoppingList.map((item) => (
            <label key={item.id} className="flex items-center p-2 bg-white rounded cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleItem(item.id)}
                className="w-5 h-5 mr-3"
              />
              <span className={item.done ? 'line-through text-gray-400' : 'text-gray-700'}>{item.item}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ajouter un item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            className="flex-1 px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={addItem}
            className="px-4 py-2 bg-blue-400 text-white font-bold rounded-lg hover:bg-blue-500"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

// Onglet: Galerie & Médias 📸
const GalleryTab = () => {
  const [photos, setPhotos] = useState([
    { id: 1, src: '🎉', alt: 'Moment amusant' },
    { id: 2, src: '🌅', alt: 'Coucher de soleil' },
    { id: 3, src: '🥳', alt: 'Fête' },
  ]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold text-purple-700 mb-4">📸 Galerie & Médias</h2>

      {/* Playlist Deezer */}
      <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg p-4 border-2 border-purple-300 overflow-hidden">
        <h3 className="font-bold text-lg text-purple-700 mb-3">🎵 Playlist Musique</h3>
        <iframe 
          title="deezer-widget" 
          src="https://widget.deezer.com/widget/dark/playlist/15298797043" 
          width="100%" 
          height="300" 
          frameBorder="0" 
          allowTransparency="true" 
          allow="encrypted-media; clipboard-write"
        ></iframe>
      </div>

      {/* Galerie photos */}
      <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg p-4 border-2 border-pink-300">
        <h3 className="font-bold text-lg text-pink-700 mb-3">📷 Photos</h3>
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="aspect-square bg-white rounded-lg flex items-center justify-center text-4xl border-2 border-pink-300 hover:border-pink-500 transition cursor-pointer">
              {photo.src}
            </div>
          ))}
          <div className="aspect-square bg-white rounded-lg flex items-center justify-center text-2xl border-2 border-pink-300 border-dashed hover:border-pink-500 transition cursor-pointer">
            + 📸
          </div>
        </div>
      </div>
    </div>
  );
};

// Onglet: Surprises 🎁
const SurprisesTab = () => {
  const [code, setCode] = useState('');
  const [revealed, setRevealed] = useState(false);
  const SURPRISE_CODE = 'MAGIE';

  const handleReveal = () => {
    if (code.toUpperCase() === SURPRISE_CODE) {
      setRevealed(true);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-purple-700 mb-4">🎁 Surprises Secrètes</h2>

      <div className="bg-gradient-to-br from-rose-200 to-purple-200 rounded-lg p-6 border-3 border-purple-400">
        {!revealed ? (
          <div className="space-y-4">
            <p className="text-center text-lg text-purple-700 font-bold">🔐 Il y a un secret ici...</p>
            <p className="text-center text-sm text-purple-600">Entrez le code pour le découvrir ✨</p>
            
            <input
              type="password"
              placeholder="Code secret"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-lg border-2 border-purple-300 focus:outline-none focus:border-pink-400 text-center font-bold"
            />
            
            <button
              onClick={handleReveal}
              className="w-full py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold rounded-lg hover:from-pink-500 hover:to-purple-500 transition"
            >
              🎉 Découvrir
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-2xl mb-4">🎊✨🎉</p>
            <p className="text-lg font-bold text-purple-700">Surprise débloquée !</p>
            <div className="bg-white rounded-lg p-6 border-2 border-purple-400">
              <p className="text-sm text-gray-600 mb-2">🎥 Vidéo surprise:</p>
              <p className="text-center text-4xl mb-4">🎬</p>
              <p className="text-gray-700">Une vidéo marrante vous attend ici 📹</p>
            </div>
            <button
              onClick={() => { setCode(''); setRevealed(false); }}
              className="w-full py-2 bg-purple-300 text-white font-bold rounded-lg hover:bg-purple-400"
            >
              ← Retour
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// App principale
const SejourApp = ({ supabaseUrl, supabaseKey }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('planning');

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const tabs = [
    { id: 'planning', label: '📅', name: 'Planning', component: PlanningTab },
    { id: 'games', label: '🎲', name: 'Jeux', component: GamesTab },
    { id: 'meals', label: '🍽️', name: 'Repas', component: MealsTab },
    { id: 'gallery', label: '📸', name: 'Galerie', component: GalleryTab },
    { id: 'surprises', label: '🎁', name: 'Surprises', component: SurprisesTab },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || PlanningTab;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-300 to-pink-300 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold text-center">✨ Séjour Magique ✨</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <ActiveComponent />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-purple-300 shadow-xl">
        <div className="grid grid-cols-5 gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 flex flex-col items-center justify-center font-bold transition ${
                activeTab === tab.id
                  ? 'bg-gradient-to-t from-pink-200 to-purple-200 text-purple-700 border-t-4 border-purple-400'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <span className="text-2xl">{tab.label}</span>
              <span className="text-xs mt-1">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Export avec Supabase
export default function App() {
  const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
  const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

  return (
    <SupabaseProvider supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_KEY}>
      <SejourApp supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_KEY} />
    </SupabaseProvider>
  );
}
