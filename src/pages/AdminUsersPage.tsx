import React, { useState, useEffect } from 'react';
import api from '../api/axios.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { User } from '../types.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import toast from 'react-hot-toast';
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  UserCog,
  RefreshCw,
  Ban,
  Activity,
  CalendarDays,
  ShoppingBag
} from 'lucide-react';

const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Could not load user listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Promote / Demote Role toggle
  const handleToggleRole = async (target: User) => {
    if (target.id === currentUser?.id) {
      toast.error('You are strictly forbidden from demoting your own administrator permissions!');
      return;
    }

    const nextRole = target.role === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/admin/users/${target.id}/role`, { role: nextRole });
      toast.success(
        nextRole === 'admin' 
          ? `SUCCESS! Promoted ${target.name} to administrator role.` 
          : `Demoted ${target.name} to general customer role.`
      );
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Role change rejected.');
    }
  };

  // Enable / disable account toggle (Ban / Unban)
  const handleToggleStatus = async (target: User) => {
    if (target.id === currentUser?.id) {
      toast.error('You are strictly forbidden from locked-out or disabling your own admin account.');
      return;
    }

    const nextActive = !target.is_active;
    try {
      await api.put(`/admin/users/${target.id}/status`, { is_active: nextActive });
      toast.success(
        nextActive
          ? `Standard access has been restored for customer account: "${target.name}".`
          : `DISABLED customer account "${target.name}". This profile won't be authorized to complete login.`
      );
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Account toggle failed.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Querying staff & customer registries..." fullPage={true} />;
  }

  return (
    <div className="bento-grid-container min-h-screen pb-20 pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-sans tracking-tight flex items-center gap-2">
              <Users className="w-7 h-7 text-indigo-650" />
              Users and Staff Directory
            </h1>
            <p className="text-slate-500 text-xs font-semibold mt-1 uppercase tracking-wide">
              Manage roles, permissions, & status locks
            </p>
          </div>

          <button
            onClick={fetchUsers}
            className="p-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-650 inline-flex items-center gap-1.5 transition-all shadow-xs"
            title="Refresh Account Data Logs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Account Data</span>
          </button>
        </div>

        {/* User Card list / Table summaries */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-4.5 px-6">ID</th>
                  <th className="py-4.5 px-6">Account User Info</th>
                  <th className="py-4.5 px-6 text-center">Registrar Role</th>
                  <th className="py-4.5 px-6 text-center">Checkout Count</th>
                  <th className="py-4.5 px-6 text-center">Account status</th>
                  <th className="py-4.5 px-6 text-right">Actions / Access Locks</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 font-semibold text-gray-800">
                {users.map((profile) => {
                  const isMe = profile.id === currentUser?.id;
                  
                  // Join date formatter
                  const joinDate = profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'Unknown';

                  return (
                    <tr key={profile.id} className={`hover:bg-gray-50/40 ${!profile.is_active ? 'bg-rose-50/15' : ''}`}>
                      
                      {/* ID */}
                      <td className="py-4.5 px-6 font-mono text-xs text-gray-400">
                        #{profile.id}
                      </td>

                      {/* Name / Email / Join date */}
                      <td className="py-4.5 px-6">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="block font-bold text-gray-900 leading-snug">{profile.name}</span>
                            {isMe && (
                              <span className="bg-indigo-600/10 text-indigo-750 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full select-none">
                                You
                              </span>
                            )}
                          </div>
                          
                          <span className="block text-xs text-gray-450 font-medium truncate mt-0.5">{profile.email}</span>
                          
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1.5 leading-none">
                            <CalendarDays className="w-3.5 h-3.5 text-gray-300" />
                            <span>Registered on {joinDate}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role representation with custom tag colors */}
                      <td className="py-4.5 px-6 text-center">
                        <span className={`inline-block text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border ${
                          profile.role === 'admin'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200/50'
                            : 'bg-gray-50 text-gray-600 border-gray-150'
                        }`}>
                          {profile.role}
                        </span>
                      </td>

                      {/* Historical Checkout counts */}
                      <td className="py-4.5 px-6 text-center">
                        <div className="inline-flex items-center space-x-1 font-sans text-sm font-extrabold text-gray-900">
                          <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                          <span>{profile.orderCount || 0}</span>
                        </div>
                      </td>

                      {/* Status lock */}
                      <td className="py-4.5 px-6 text-center">
                        {profile.is_active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-extrabold text-xs">
                            <Activity className="w-3.5 h-3.5 animate-pulse" />
                            <span>Authorized</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-500 font-extrabold text-xs">
                            <Ban className="w-3.5 h-3.5" />
                            <span>Banned / Disabled</span>
                          </span>
                        )}
                      </td>

                      {/* Management Action limits */}
                      <td className="py-4.5 px-6 text-right">
                        <div className="inline-flex space-x-2">
                          
                          {/* Role Toggle Button */}
                          <button
                            onClick={() => handleToggleRole(profile)}
                            disabled={isMe}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isMe 
                                ? 'bg-gray-50/60 text-gray-300 border-gray-100 cursor-not-allowed'
                                : 'bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 border-gray-250 cursor-pointer active:scale-95'
                            }`}
                            title={profile.role === 'admin' ? "Demote account to general user" : "Promote account to Staff Admin"}
                          >
                            <UserCog className="w-4 h-4" />
                            <span>{profile.role === 'admin' ? 'Demote' : 'Promote'}</span>
                          </button>

                          {/* Lock Status Switcher (Disable user) */}
                          <button
                            onClick={() => handleToggleStatus(profile)}
                            disabled={isMe}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isMe 
                                ? 'bg-gray-50/60 text-gray-300 border-gray-100 cursor-not-allowed'
                                : profile.is_active
                                ? 'hover:bg-rose-50 text-rose-500 border-rose-100 hover:border-rose-200 cursor-pointer active:scale-95'
                                : 'hover:bg-emerald-50 text-emerald-650 border-emerald-100 hover:border-emerald-250 cursor-pointer active:scale-95'
                            }`}
                            title={profile.is_active ? "Suspend Account/Lockout Customer" : "Approve Account and Grant Access"}
                          >
                            {profile.is_active ? <UserX className="w-4.5 h-4.5" /> : <UserCheck className="w-4.5 h-4.5" />}
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminUsersPage;
