import React, { useState, useEffect } from 'react';
import { User, Shield, Briefcase, Search, MoreVertical, CheckCircle2, Crown, ShieldAlert } from 'lucide-react';
import { Card } from '../ui/Card';

interface TeamMember { id: string; name: string; email: string; role: string; tier?: string; dept?: string; avatar?: string | null; status?: string; }

const ROLES = [
  { label: 'Staff / Engineer', value: 'Engineer', tier: 'L1', color: 'bg-slate-500' },
  { label: 'Dept Head / Manager', value: 'Dept Head', tier: 'L2', color: 'bg-blue-500' },
  { label: 'Executive / Chairman', value: 'Chairman', tier: 'L3', color: 'bg-emerald-500' },
  { label: 'Super Admin', value: 'Super Admin', tier: 'L4', color: 'bg-rose-500' },
];

export const TeamManagement: React.FC = () => {
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/resources/team-members')
      .then(r => r.json())
      .then((data: TeamMember[]) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const getTierBadge = (tier: string) => {
    switch(tier) {
      case 'L4': return <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-caption font-bold italic tracking-wider"><ShieldAlert size={10} /> <span>L4 Platinum</span></span>;
      case 'L3': return <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-caption font-bold italic tracking-wider"><Crown size={10} /> <span>L3 Gold</span></span>;
      case 'L2': return <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-caption font-bold italic tracking-wider"><Shield size={10} /> <span>L2 Silver</span></span>;
      default: return <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-500/20 text-slate-200 border border-slate-500/30 text-caption font-bold italic tracking-wider"><User size={10} /> <span>L1 Bronze</span></span>;
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const roleDef = ROLES.find(r => r.value === newRole);
    if (!roleDef) return;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole, tier: roleDef.tier } : u));
    await fetch(`/api/resources/team-members`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, role: newRole, tier: roleDef.tier }),
    }).catch(console.error);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--surface-layer)] backdrop-blur-xl p-6 rounded-2xl border border-[var(--surface-border)] shadow-sm">
         <div>
            <h3 className="text-lg font-bold italic text-gray-900 flex items-center">
               <Briefcase className="mr-2 text-[var(--color-info)]" size={20} /> Team Access Control
            </h3>
            <p className="text-xs text-gray-500 mt-1">Manage global permissions and department assignments.</p>
         </div>
         <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-[var(--color-info)] transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search team members..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-[var(--surface-border)] rounded-xl pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-info)] transition-all w-full md:w-64"
            />
         </div>
      </div>

      {/* User Grid */}
      <div className="bg-[var(--surface-layer)] backdrop-blur-xl border border-[var(--surface-border)] rounded-2xl shadow-sm overflow-hidden">
         <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white border-b border-[var(--surface-border)] text-caption font-bold italic text-gray-500 tracking-wider">
            <div className="col-span-4">User Identity</div>
            <div className="col-span-3">Department</div>
            <div className="col-span-3">Access Level</div>
            <div className="col-span-2 text-right">Actions</div>
         </div>

         <div className="divide-y divide-[var(--surface-border)]">
            {filteredUsers.map((user) => (
               <div key={user.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[var(--surface-elevated)] transition-colors group">
                  {/* Identity */}
                  <div className="col-span-4 flex items-center space-x-3">
                     <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 font-bold italic border border-gray-200 shadow-inner">
                        {user.name.charAt(0)}
                     </div>
                     <div>
                        <p className="text-sm font-bold italic text-gray-900 group-hover:text-[var(--color-info)] transition-colors">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                     </div>
                  </div>

                  {/* Department */}
                  <div className="col-span-3">
                     <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs border border-gray-200">
                        {user.dept}
                     </span>
                  </div>

                  {/* Access Level (Role Selector) */}
                  <div className="col-span-3">
                     <div className="space-y-2">
                        {getTierBadge(user.tier)}
                        <select 
                           value={user.role}
                           onChange={(e) => handleRoleChange(user.id, e.target.value)}
                           className="w-full bg-gray-100 border border-gray-200 text-gray-900 text-xs rounded px-2 py-1 focus:outline-none focus:border-[var(--color-info)] cursor-pointer"
                        >
                           {ROLES.map(role => (
                              <option key={role.value} value={role.value}>{role.label}</option>
                           ))}
                        </select>
                     </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 text-right">
                     <button className="text-gray-500 hover:text-gray-900 transition-colors p-2 hover:bg-gray-50 rounded-lg">
                        <MoreVertical size={16} />
                     </button>
                  </div>
               </div>
            ))}
         </div>
         {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">No team members found.</div>
         )}
      </div>

      {/* Security Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
            { label: 'L1 Staff', desc: 'Personal Tasks Only', color: 'border-gray-200 text-gray-500' },
            { label: 'L2 Manager', desc: 'Department + Team', color: 'border-blue-500/30 text-blue-400' },
            { label: 'L3 Executive', desc: 'Full Portfolio + Risk', color: 'border-emerald-500/30 text-emerald-400' },
            { label: 'L4 Admin', desc: 'System Configuration', color: 'border-rose-500/30 text-rose-400' },
         ].map((tier, i) => (
            <div key={i} className={`bg-[var(--surface-layer)] border ${tier.color} rounded-xl p-3 text-center`}>
               <h4 className="font-bold italic text-sm">{tier.label}</h4>
               <p className="text-caption opacity-70">{tier.desc}</p>
            </div>
         ))}
      </div>
    </div>
  );
};
