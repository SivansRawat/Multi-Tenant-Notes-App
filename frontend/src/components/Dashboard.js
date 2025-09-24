// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import NotesList from './NotesList';
// import NoteForm from './NoteForm';
// import UpgradeModal from './UpgradeModal';
// import { notesAPI, tenantsAPI } from '../services/api';
// import './Dashboard.css';

// const Dashboard = () => {
//   const { user, logout, isAdmin, getTenantInfo } = useAuth();
//   const [notes, setNotes] = useState([]);
//   const [tenantInfo, setTenantInfo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showNoteForm, setShowNoteForm] = useState(false);
//   const [editingNote, setEditingNote] = useState(null);
//   const [showUpgradeModal, setShowUpgradeModal] = useState(false);

//   useEffect(() => {
//     loadDashboardData();
//   }, []);

//   const loadDashboardData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const tenant = getTenantInfo();
//       if (!tenant) {
//         throw new Error('No tenant information available');
//       }

//       // Load notes and tenant info
//       const [notesResponse, tenantResponse] = await Promise.all([
//         notesAPI.getNotes(),
//         tenantsAPI.getTenant(tenant.slug)
//       ]);

//       setNotes(notesResponse.notes);
//       setTenantInfo(tenantResponse.tenant);
//     } catch (error) {
//       console.error('Failed to load dashboard data:', error);
//       setError(error.response?.data?.error || 'Failed to load data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateNote = async (noteData) => {
//     try {
//       const response = await notesAPI.createNote(noteData);
//       setNotes(prev => [response.note, ...prev]);
//       setShowNoteForm(false);
//       await loadDashboardData(); // Refresh to get updated counts
//     } catch (error) {
//       if (error.response?.data?.code === 'PLAN_LIMIT_REACHED') {
//         setShowUpgradeModal(true);
//       }
//       throw error;
//     }
//   };

//   const handleUpdateNote = async (id, noteData) => {
//     try {
//       const response = await notesAPI.updateNote(id, noteData);
//       setNotes(prev => prev.map(note => 
//         note.id === id ? response.note : note
//       ));
//       setEditingNote(null);
//     } catch (error) {
//       throw error;
//     }
//   };

//   const handleDeleteNote = async (id) => {
//     try {
//       await notesAPI.deleteNote(id);
//       setNotes(prev => prev.filter(note => note.id !== id));
//       await loadDashboardData(); // Refresh to get updated counts
//     } catch (error) {
//       throw error;
//     }
//   };

//   const handleUpgrade = async () => {
//     try {
//       const tenant = getTenantInfo();
//       await tenantsAPI.upgradeTenant(tenant.slug);
//       await loadDashboardData();
//       setShowUpgradeModal(false);
//     } catch (error) {
//       console.error('Upgrade failed:', error);
//       throw error;
//     }
//   };

//   const isFreePlanLimitReached = () => {
//     return tenantInfo?.plan === 'free' && 
//            tenantInfo?.note_count >= (tenantInfo?.note_limit || 3);
//   };

//   if (loading) {
//     return (
//       <div className="dashboard-loading">
//         <div className="loading-spinner"></div>
//         <p>Loading dashboard...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="dashboard-error">
//         <h2>Error Loading Dashboard</h2>
//         <p>{error}</p>
//         <button onClick={loadDashboardData} className="retry-button">
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="dashboard">
//       <header className="dashboard-header">
//         <div className="header-content">
//           <div className="header-left">
//             <h1>📝 SaaS Notes</h1>
//             <div className="tenant-info">
//               <span className="tenant-name">{tenantInfo?.name}</span>
//               <span className={`plan-badge plan-${tenantInfo?.plan}`}>
//                 {tenantInfo?.plan?.toUpperCase()} Plan
//               </span>
//             </div>
//           </div>

//           <div className="header-right">
//             <div className="user-info">
//               <span className="user-email">{user?.email}</span>
//               <span className={`role-badge role-${user?.role}`}>
//                 {user?.role?.toUpperCase()}
//               </span>
//             </div>
//             <button onClick={logout} className="logout-button">
//               Logout
//             </button>
//           </div>
//         </div>
//       </header>

//       <main className="dashboard-main">
//         <div className="dashboard-content">
//           <div className="content-header">
//             <div className="content-header-left">
//               <h2>My Notes</h2>
//               {tenantInfo && (
//                 <div className="notes-count">
//                   {tenantInfo.note_count} / {tenantInfo.note_limit || '∞'} notes
//                   {tenantInfo.plan === 'free' && (
//                     <span className="limit-warning">
//                       ({tenantInfo.note_limit - tenantInfo.note_count} remaining)
//                     </span>
//                   )}
//                 </div>
//               )}
//             </div>

//             <div className="content-header-right">
//               {tenantInfo?.plan === 'free' && isAdmin() && (
//                 <button 
//                   onClick={() => setShowUpgradeModal(true)}
//                   className="upgrade-button"
//                 >
//                   ⚡ Upgrade to Pro
//                 </button>
//               )}

//               <button 
//                 onClick={() => setShowNoteForm(true)}
//                 className="create-note-button"
//                 disabled={isFreePlanLimitReached()}
//               >
//                 + New Note
//               </button>
//             </div>
//           </div>

//           {isFreePlanLimitReached() && (
//             <div className="plan-limit-warning">
//               <p>
//                 📈 You've reached the free plan limit of {tenantInfo?.note_limit} notes.
//                 {isAdmin() && (
//                   <>
//                     {' '}
//                     <button 
//                       onClick={() => setShowUpgradeModal(true)}
//                       className="upgrade-link"
//                     >
//                       Upgrade to Pro
//                     </button> for unlimited notes.
//                   </>
//                 )}
//               </p>
//             </div>
//           )}

//           <NotesList
//             notes={notes}
//             onEdit={setEditingNote}
//             onDelete={handleDeleteNote}
//             loading={loading}
//           />
//         </div>
//       </main>

//       {/* Modals */}
//       {showNoteForm && (
//         <NoteForm
//           onSubmit={handleCreateNote}
//           onCancel={() => setShowNoteForm(false)}
//         />
//       )}

//       {editingNote && (
//         <NoteForm
//           note={editingNote}
//           onSubmit={(data) => handleUpdateNote(editingNote.id, data)}
//           onCancel={() => setEditingNote(null)}
//           isEditing={true}
//         />
//       )}

//       {showUpgradeModal && (
//         <UpgradeModal
//           onUpgrade={handleUpgrade}
//           onCancel={() => setShowUpgradeModal(false)}
//           tenantInfo={tenantInfo}
//           isAdmin={isAdmin()}
//         />
//       )}
//     </div>
//   );
// };

// export default Dashboard;



import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import NotesList from './NotesList';
import NoteForm from './NoteForm';
import UpgradeModal from './UpgradeModal';
import { notesAPI, tenantsAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout, isAdmin, getTenantInfo } = useAuth();
  const [notes, setNotes] = useState([]);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Wrap load function with useCallback
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const tenant = getTenantInfo();
      if (!tenant) {
        throw new Error('No tenant information available');
      }

      // Load data in parallel
      const [notesResponse, tenantResponse] = await Promise.all([
        notesAPI.getNotes(),
        tenantsAPI.getTenant(tenant.slug),
      ]);

      setNotes(notesResponse.notes);
      setTenantInfo(tenantResponse.tenant);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError(error.response?.data || error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [getTenantInfo]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleCreateNote = async (noteData) => {
    try {
      const response = await notesAPI.createNote(noteData);
      setNotes((prev) => [response.note, ...prev]);
      setShowNoteForm(false);
      await loadDashboardData(); // Refresh to update counts
    } catch (error) {
      if (error.response?.data?.code === 'PLAN_LIMIT_REACHED') {
        setShowUpgradeModal(true);
      }
      throw error;
    }
  };

  const handleUpdateNote = async (id, noteData) => {
    try {
      const response = await notesAPI.updateNote(id, noteData);
      setNotes((prev) => prev.map((note) => (note.id === id ? response.note : note)));
      setEditingNote(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await notesAPI.deleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      await loadDashboardData(); // Refresh counts
    } catch (error) {
      throw error;
    }
  };

  const handleUpgrade = async () => {
    try {
      const tenant = getTenantInfo();
      await tenantsAPI.upgradeTenant(tenant.slug);
      await loadDashboardData();
      setShowUpgradeModal(false);
    } catch (error) {
      console.error('Upgrade failed:', error);
      throw error;
    }
  };

  const isFreePlan = tenantInfo?.plan?.toLowerCase() === 'free';
  const isAtLimit = isFreePlan && tenantInfo?.note_count >= (tenantInfo?.note_limit || 3);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button onClick={loadDashboardData} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📝 SaaS Notes</h1>
            <div className="tenant-info">
              <span className="tenant-name">{tenantInfo?.name}</span>
              <span className={`plan-badge plan-${tenantInfo?.plan}`}>
                {tenantInfo?.plan?.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-email">{user?.email}</span>
              <span className={`role-badge role-${user?.role}`}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="content-header">
            <div className="content-header-left">
              <h2>My Notes</h2>
              {tenantInfo && (
                <div className="notes-count">
                  {tenantInfo.note_count} / {tenantInfo.note_limit || '∞'} notes
                  {isFreePlan && (
                    <span className="limit-warning">
                      {' '}
                      {tenantInfo.note_limit - tenantInfo.note_count} remaining
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="content-header-right">
              {isFreePlan && isAdmin() && (
                <button onClick={() => setShowUpgradeModal(true)} className="upgrade-button">
                  ⚡ Upgrade to Pro
                </button>
              )}
              <button onClick={() => setShowNoteForm(true)} disabled={isAtLimit} className="create-note-button">
                + New Note
              </button>
            </div>
          </div>

          {isAtLimit && (
            <div className="plan-limit-warning">
              <p>
                📈 You've reached the free plan limit of {tenantInfo?.note_limit} notes.
                {isAdmin() && (
                  <>
                    {' '}
                    <button onClick={() => setShowUpgradeModal(true)} className="upgrade-link">
                      Upgrade to Pro
                    </button>{' '}
                    for unlimited notes.
                  </>
                )}
              </p>
            </div>
          )}

          <NotesList
            notes={notes}
            onEdit={setEditingNote}
            onDelete={handleDeleteNote}
            loading={loading}
          />
        </div>
      </main>

      {/* Modals */}
      {showNoteForm && (
        <NoteForm onSubmit={handleCreateNote} onCancel={() => setShowNoteForm(false)} />
      )}

      {editingNote && (
        <NoteForm
          note={editingNote}
          onSubmit={(data) => handleUpdateNote(editingNote.id, data)}
          onCancel={() => setEditingNote(null)}
          isEditing={true}
        />
      )}

      {showUpgradeModal && (
        <UpgradeModal
          onUpgrade={handleUpgrade}
          onCancel={() => setShowUpgradeModal(false)}
          tenantInfo={tenantInfo}
          isAdmin={isAdmin()}
        />
      )}
    </div>
  );
};

export default Dashboard;
