'use client';

import React from 'react';
import { Mail, Briefcase, User } from 'lucide-react';
import { TeamMember } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface ResourceGridProps {
  members: TeamMember[];
  onRefresh: () => void;
  onAdd: () => void;
}

export default function ResourceGrid({ members, onRefresh, onAdd }: ResourceGridProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <Card key={member.id} variant="interactive" padding="none">
            <CardHeader className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-500/10 rounded-lg flex items-center justify-center text-brand-500">
                  <User size={20} />
                </div>
                <div>
                  <CardTitle>{member.name}</CardTitle>
                  <p className="text-caption font-mono text-gray-500 tracking-widest">{member.role}</p>
                </div>
              </div>
              <Badge variant={member.is_active ? 'success' : 'outline'}>
                {member.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2 text-gov-label font-mono">
                {member.email && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Mail size={12} className="text-gray-500" />
                    {member.email}
                  </div>
                )}
                {member.department && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Briefcase size={12} className="text-gray-500" />
                    {member.department}
                  </div>
                )}
              </div>

              {member.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {member.skills.slice(0, 4).map((skill) => (
                    <span key={skill} className="bg-gray-50 text-gray-500 text-gov-label px-2 py-0.5 rounded border border-gray-200 font-bold italic">
                      {skill}
                    </span>
                  ))}
                  {member.skills.length > 4 && (
                    <span className="text-gov-label text-gray-500 font-bold italic">+{member.skills.length - 4} MORE</span>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-gov-label font-bold italic text-gray-500 tracking-widest">Target Utilization</span>
                <span className="text-xs font-bold italic text-emerald-500">{member.utilization_target_percent}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-24 text-gray-500 text-sm">
          <p>No personnel nodes detected in the registry.</p>
        </div>
      )}
    </div>
  );
}
