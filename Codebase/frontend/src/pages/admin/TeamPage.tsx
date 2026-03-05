import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { api } from '@/lib/api';
import type { Profile } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Loader2,
  Plus,
  Mail,
  Phone,
  Briefcase,
  UserPlus,
  Users,
  Search,
  Edit,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

interface TeamMemberForm {
  full_name: string;
  email: string;
  password: string;
  designation: string;
  skills: string;
  phone: string;
}

const EMPTY_FORM: TeamMemberForm = {
  full_name: '',
  email: '',
  password: '',
  designation: '',
  skills: '',
  phone: '',
};

export default function TeamPage() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailMember, setDetailMember] = useState<Profile | null>(null);
  const [editMember, setEditMember] = useState<Profile | null>(null);
  const [form, setForm] = useState<TeamMemberForm>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMembers = useCallback(async () => {
    try {
      const data = await api.get<Profile[]>('/api/team/members');
      setMembers(data);
    } catch (err) {
      console.error('Failed to fetch team members:', err);
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  function openAddDialog() {
    setEditMember(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEditDialog(member: Profile) {
    setEditMember(member);
    const skills = Array.isArray(member.skills)
      ? (member.skills as string[]).join(', ')
      : '';
    setForm({
      full_name: member.full_name || '',
      email: member.email,
      password: '',
      designation: member.designation || '',
      skills,
      phone: member.phone || '',
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const skillsArray = form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (editMember) {
        await api.patch(`/api/team/members/${editMember.id}`, {
          full_name: form.full_name,
          designation: form.designation || null,
          skills: skillsArray.length > 0 ? skillsArray : null,
          phone: form.phone || null,
        });
        toast.success('Team member updated');
      } else {
        await api.post('/api/team/members', {
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          designation: form.designation || null,
          skills: skillsArray.length > 0 ? skillsArray : null,
          phone: form.phone || null,
        });
        toast.success('Team member added');
      }

      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setEditMember(null);
      fetchMembers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  function getInitials(name?: string | null) {
    if (!name) return '?';
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function parseSkills(skills: unknown): string[] {
    if (Array.isArray(skills)) return skills as string[];
    if (typeof skills === 'string') {
      try {
        const parsed = JSON.parse(skills);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  const filtered = members.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.full_name?.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.designation?.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-admin-text-muted" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-admin-text-primary">
              Team Members
            </h1>
            <p className="mt-1 text-sm text-admin-text-muted">
              Manage your team and assign them to projects.
            </p>
          </div>
          <Button
            onClick={openAddDialog}
            className="bg-admin-primary hover:bg-admin-primary/90 text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or designation..."
            className="pl-9 border-admin-border bg-admin-surface text-admin-text-primary placeholder:text-admin-text-muted"
          />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <Card className="border-admin-border bg-admin-surface">
            <CardContent className="py-16 text-center">
              <Users className="h-12 w-12 mx-auto text-admin-text-muted/40 mb-3" />
              <p className="text-sm text-admin-text-muted">
                {searchQuery
                  ? 'No team members match your search.'
                  : 'No team members yet. Add your first team member.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((member) => {
              const skills = parseSkills(member.skills);

              return (
                <Card
                  key={member.id}
                  className="border-admin-border bg-admin-surface hover:border-admin-primary/20 transition-colors group"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={member.avatar_url ?? undefined} />
                        <AvatarFallback className="bg-admin-bg text-admin-text-secondary text-sm font-medium">
                          {getInitials(member.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-admin-text-primary truncate">
                          {member.full_name || 'Unnamed'}
                        </p>
                        {member.designation && (
                          <p className="text-xs text-admin-text-muted truncate">
                            {member.designation}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-admin-text-secondary">
                        <Mail className="h-3 w-3 text-admin-text-muted shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2 text-xs text-admin-text-secondary">
                          <Phone className="h-3 w-3 text-admin-text-muted shrink-0" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </div>

                    {skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {skills.slice(0, 4).map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-[10px] border-admin-border text-admin-text-muted px-2 py-0"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {skills.length > 4 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-admin-border text-admin-text-muted px-2 py-0"
                          >
                            +{skills.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-2 pt-3 border-t border-admin-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-admin-text-muted hover:text-admin-text-primary"
                        onClick={() => setDetailMember(member)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-admin-text-muted hover:text-admin-text-primary"
                        onClick={() => openEditDialog(member)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add / Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editMember ? 'Edit Team Member' : 'Add Team Member'}
              </DialogTitle>
              <DialogDescription>
                {editMember
                  ? 'Update team member information.'
                  : 'Create a new team member account with login credentials.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-admin-text-primary">
                  Full Name
                </Label>
                <Input
                  value={form.full_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, full_name: e.target.value }))
                  }
                  required
                  placeholder="John Doe"
                  className="border-admin-border"
                />
              </div>

              {!editMember && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm text-admin-text-primary">
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      required
                      placeholder="john@example.com"
                      className="border-admin-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-admin-text-primary">
                      Password
                    </Label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, password: e.target.value }))
                      }
                      required
                      placeholder="Min 6 characters"
                      className="border-admin-border"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className="text-sm text-admin-text-primary">
                  Designation
                </Label>
                <Input
                  value={form.designation}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, designation: e.target.value }))
                  }
                  placeholder="e.g. Frontend Developer"
                  className="border-admin-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-admin-text-primary">
                  Skills (comma-separated)
                </Label>
                <Input
                  value={form.skills}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, skills: e.target.value }))
                  }
                  placeholder="React, TypeScript, Node.js"
                  className="border-admin-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-admin-text-primary">Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+1 234 567 890"
                  className="border-admin-border"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-admin-primary hover:bg-admin-primary/90 text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1.5" />
                  )}
                  {editMember ? 'Save Changes' : 'Add Member'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog
          open={detailMember !== null}
          onOpenChange={(open) => !open && setDetailMember(null)}
        >
          <DialogContent className="sm:max-w-md">
            {detailMember && (
              <>
                <DialogHeader>
                  <DialogTitle>Team Member Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={detailMember.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-admin-bg text-admin-text-secondary text-lg font-medium">
                        {getInitials(detailMember.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-base font-semibold text-admin-text-primary">
                        {detailMember.full_name || 'Unnamed'}
                      </p>
                      {detailMember.designation && (
                        <p className="text-sm text-admin-text-muted">
                          {detailMember.designation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <DetailRow
                      icon={Mail}
                      label="Email"
                      value={detailMember.email}
                    />
                    {detailMember.phone && (
                      <DetailRow
                        icon={Phone}
                        label="Phone"
                        value={detailMember.phone}
                      />
                    )}
                    {detailMember.designation && (
                      <DetailRow
                        icon={Briefcase}
                        label="Designation"
                        value={detailMember.designation}
                      />
                    )}
                  </div>

                  {parseSkills(detailMember.skills).length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-admin-text-muted uppercase tracking-wider mb-2">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {parseSkills(detailMember.skills).map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-xs border-admin-border text-admin-text-secondary"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailMember.bio && (
                    <div>
                      <p className="text-xs font-medium text-admin-text-muted uppercase tracking-wider mb-2">
                        Bio
                      </p>
                      <p className="text-sm text-admin-text-secondary">
                        {detailMember.bio}
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDetailMember(null);
                      openEditDialog(detailMember);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1.5" />
                    Edit
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-admin-bg">
        <Icon className="h-4 w-4 text-admin-text-muted" />
      </div>
      <div>
        <p className="text-[11px] text-admin-text-muted">{label}</p>
        <p className="text-sm text-admin-text-primary">{value}</p>
      </div>
    </div>
  );
}
