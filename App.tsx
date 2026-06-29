 'use client';

import { useState, useEffect } from 'react';
import { GroupCard } from './components/group-card';
import { GroupHeader } from './components/group-header';
import { InvoiceTable } from './components/invoice-table';
import { AddInvoiceModal } from './components/add-invoice-modal';
import { InvoiceDetail } from './components/invoice-detail';
import { AddMemberModal } from './components/add-member-modal';
import { MemberListModal } from './components/member-list-modal';
import { CreateGroupModal } from './components/create-group-modal';
import { EditGroupModal } from './components/edit-group-modal';
import { ViewBalancesModal } from './components/view-balances-modal';
import { Button } from './components/ui/button';
import { Plus, Receipt, ArrowLeft } from 'lucide-react';
import { mockGroups, mockInvoices } from './lib/mock-data';
import { api } from './lib/client/api';
import { LoginScreen } from './components/login-screen';
import { useAuth } from './context/AuthContext';
import { Invoice, Group, Member } from './types';


type View = 'dashboard' | 'group-detail' | 'invoice-detail';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [invoices, setInvoices] = useState(mockInvoices);
  const { token, user, loading, logout } = useAuth();
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showMemberListModal, setShowMemberListModal] = useState(false);
  const [showBalancesModal, setShowBalancesModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [invoiceMode, setInvoiceMode] = useState<'view' | 'edit'>('view');

  const handleGroupClick = (groupId: string) => {
    setSelectedGroupId(groupId);
    setCurrentView('group-detail');
  };

  const handleCreateGroup = (group: Group) => {
    if (!token) return;

    api.createGroup({ name: group.name, members: group.members.map((m) => ({ name: m.name, email: m.email, avatar: m.avatar, color: m.color })) }, token)
      .then((g: any) => setGroups((prev) => [g, ...prev]))
      .catch(() => setGroups((prev) => [group, ...prev]));
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedGroupId(null);
  };

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setInvoiceMode('view');
    setCurrentView('invoice-detail');
  };

  // const handleEditInvoice = (invoiceId: string) => {
  //   setSelectedInvoiceId(invoiceId);
  //   setInvoiceMode('edit'); 
  //   setCurrentView('invoice-detail');
  // };
  const handleEditInvoice = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    // If invoice was finalized → reopen it
    if (invoice.status === "reviewed") {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId
            ? { ...inv, status: "draft" }
            : inv
        )
      );
    }

    setSelectedInvoiceId(invoiceId);
    setInvoiceMode('edit');
    setCurrentView('invoice-detail');
  };


  const handleBackToGroup = () => {
    setCurrentView('group-detail');
    setSelectedInvoiceId(null);
  };

  useEffect(() => {
    if (!token) return;

    api.getGroups(token)
      .then((data: any) => { if (Array.isArray(data)) setGroups(data); })
      .catch(() => setGroups(mockGroups));

    api.getInvoices(undefined, token)
      .then((data: any) => { if (Array.isArray(data)) setInvoices(data); })
      .catch(() => setInvoices(mockInvoices));
  }, [token]);

  const handleSaveInvoice = (invoiceData: {
    merchant: string;
    date: string;
    total: number;
    items: any[];
    whoPaid: string;
  }) => {
    if (!selectedGroupId || !token) return;

    api.createInvoice({ groupId: selectedGroupId, merchant: invoiceData.merchant, date: invoiceData.date, total: invoiceData.total, items: invoiceData.items, whoPaid: invoiceData.whoPaid }, token)
      .then((inv: any) => setInvoices((prev) => [...prev, inv]))
      .catch(() => {
        const newInvoice: Invoice = {
          id: `inv-${Date.now()}`,
          groupId: selectedGroupId,
          name: `Invoice from ${invoiceData.merchant}`,
          merchant: invoiceData.merchant,
          date: new Date(invoiceData.date),
          total: invoiceData.total,
          status: 'needs-review',
          items: invoiceData.items,
          uploadedBy: 'm1',
          whoPaid: invoiceData.whoPaid,
          createdAt: new Date(),
        };
        setInvoices((prev) => [...prev, newInvoice]);
      });
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    if (!token) return;

    api.updateInvoice(updatedInvoice.id, updatedInvoice, token)
      .then((inv: any) => {
        setInvoices(invoices.map((i) => (i.id === inv.id ? inv : i)));
      })
      .catch(() => setInvoices(invoices.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv))));
    setCurrentView('group-detail');
    setSelectedInvoiceId(null);
  };

  const handleAddMember = (memberData: Omit<Member, 'id'>) => {
    if (!selectedGroupId || !token) return;

    const newMember: Member = { id: `m-${Date.now()}`, ...memberData };

    api.addMember(selectedGroupId, memberData, token)
      .then((m: any) => {
        setGroups(groups.map((group) => group.id === selectedGroupId ? { ...group, members: [...group.members, m] } : group));
      })
      .catch(() => {
        setGroups(groups.map((group) => group.id === selectedGroupId ? { ...group, members: [...group.members, newMember] } : group));
      });
  };

  const handleRemoveMember = (memberId: string) => {
    if (!selectedGroupId) return;

    const group = groups.find(g => g.id === selectedGroupId);
    if (!group) return;

    // Check if member has outstanding balances
    const groupInvoices = invoices.filter(inv => inv.groupId === selectedGroupId && inv.status === 'reviewed');
    let hasBalance = false;

    groupInvoices.forEach(invoice => {
      if (invoice.whoPaid === memberId) {
        // Check if others owe this member
        invoice.items.forEach(item => {
          const participants = item.splitAmong && item.splitAmong.length > 0 ? item.splitAmong : group.members.map(m => m.id);
          if (participants.includes(memberId)) {
            hasBalance = true;
          }
        });
      } else {
        // Check if this member owes someone
        invoice.items.forEach(item => {
          const participants = item.splitAmong && item.splitAmong.length > 0 ? item.splitAmong : group.members.map(m => m.id);
          if (participants.includes(memberId)) {
            hasBalance = true;
          }
        });
      }
    });

    if (hasBalance) {
      alert('Cannot remove member with outstanding balances. Please settle all balances first.');
      return;
    }

    if (!token) return;

    api.removeMember(selectedGroupId, memberId, token)
      .then(() => setGroups(groups.map((group) => group.id === selectedGroupId ? { ...group, members: group.members.filter((m) => m.id !== memberId) } : group)))
      .catch(() => setGroups(groups.map((group) => group.id === selectedGroupId ? { ...group, members: group.members.filter((m) => m.id !== memberId) } : group)));
  };

  const handleOpenEditMember = (member: Member) => {
    // close member list and open add-member modal in edit mode
    setShowMemberListModal(false);
    setShowAddMemberModal(true);
    // dispatch event for AddMemberModal to prefill fields
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-edit-member', { detail: { id: member.id, name: member.name, email: member.email } }));
    }, 0);
  };

  // Listen for save event from AddMemberModal when editing
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail;
      if (!detail) return;
      const { id, data } = detail as { id: string; data: Omit<Member, 'id'> };
      if (!selectedGroupId) return;
      setGroups((prev) => prev.map((g) => {
        if (g.id !== selectedGroupId) return g;
        const updatedMembers = g.members.map((m) => m.id === id ? { id, ...data } : m);
        return { ...g, members: updatedMembers };
      }));

      // persist to API if token present
      if (token) {
        const group = groups.find((g) => g.id === selectedGroupId);
        if (group) {
          const updatedMembers = group.members.map((m) => m.id === id ? { id, ...data } : m);
          api.updateGroup(selectedGroupId, { members: updatedMembers }, token).catch(() => {});
        }
      }
    };
    window.addEventListener('edit-member-saved', handler as EventListener);
    return () => window.removeEventListener('edit-member-saved', handler as EventListener);
  }, [selectedGroupId, token, groups]);

  const handleViewBalances = () => {
    setShowBalancesModal(true);
  };

  const handleOpenEditGroupName = () => {
    const group = selectedGroupId ? groups.find((g) => g.id === selectedGroupId) : null;
    if (!group) return;
    setEditingGroupName(group.name);
    setShowEditGroupModal(true);
  };

  const handleSaveGroupName = (newName: string) => {
    if (!selectedGroupId) return;
    setGroups((prev) =>
      prev.map((g) => (g.id === selectedGroupId ? { ...g, name: newName } : g))
    );

    if (!token) return;
    api.updateGroup(selectedGroupId, { name: newName }, token).catch(() => {
      // keep optimistic local state on failure
    });
  };

  const selectedGroup = selectedGroupId
    ? groups.find((g) => g.id === selectedGroupId)
    : null;

  const groupInvoices = selectedGroupId
    ? invoices.filter((inv) => inv.groupId === selectedGroupId)
    : [];

  const selectedInvoice = selectedInvoiceId
    ? invoices.find((inv) => inv.id === selectedInvoiceId)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Checking authentication...
      </div>
    );
  }

  if (!token || !user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Receipt className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl">BillTribe</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Settings
            </Button>
            <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
            <Button onClick={() => { logout(); }} size="sm">Logout</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {currentView === 'dashboard' && (
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl mb-2">Expense Groups</h2>
                <p className="text-muted-foreground">
                  Manage shared expenses and split bills with your groups
                </p>
              </div>
              <Button size="lg" className="gap-2" onClick={() => setIsCreateGroupOpen(true)}>
                <Plus className="h-5 w-5" />
                Create Group Now

              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onClick={() => handleGroupClick(group.id)}
                />
              ))}
            </div>
          </div>
        )}

        {currentView === 'group-detail' && selectedGroup && (
          <div className="max-w-7xl mx-auto">
            <Button
              variant="ghost"
              onClick={handleBackToDashboard}
              className="mb-6 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Groups
            </Button>

            <GroupHeader
              group={selectedGroup}
              onAddMember={() => setShowAddMemberModal(true)}
              onAddInvoice={() => setShowAddInvoiceModal(true)}
              onViewBalances={handleViewBalances}
              onEditGroupName={handleOpenEditGroupName}
              invoices={groupInvoices}
              onViewMembers={() => setShowMemberListModal(true)}
            />

            <div className="mb-4">
              <h3 className="text-xl">Invoices</h3>
              <p className="text-muted-foreground text-sm">
                Track and manage all invoices for this group
              </p>
            </div>

            <InvoiceTable
              invoices={groupInvoices}
              onViewInvoice={handleViewInvoice}
              onEditInvoice={handleEditInvoice}
              onDeleteInvoice={(id) => {
                if (!token) return;
                api.deleteInvoice(id, token).then(() => setInvoices(invoices.filter((inv) => inv.id !== id))).catch(() => setInvoices(invoices.filter((inv) => inv.id !== id)));
              }}
            />
          </div>
        )}

        {currentView === 'invoice-detail' && selectedInvoice && selectedGroup && (
          <InvoiceDetail
            invoice={selectedInvoice}
            groupMembers={selectedGroup.members}
            onBack={handleBackToGroup}
            onUpdate={handleUpdateInvoice}
            mode={invoiceMode}
          />
        )}
      </main>

      <AddInvoiceModal
        open={showAddInvoiceModal}
        onClose={() => setShowAddInvoiceModal(false)}
        onSave={handleSaveInvoice}
        groupMembers={selectedGroup?.members || []}
      />

      <AddMemberModal
        open={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onAdd={handleAddMember}
        existingMembers={selectedGroup?.members || []}
      />

      <CreateGroupModal
        open={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreate={handleCreateGroup}
      />

      <EditGroupModal
        open={showEditGroupModal}
        value={editingGroupName}
        onClose={() => setShowEditGroupModal(false)}
        onSave={handleSaveGroupName}
      />

      {selectedGroup && (
        <MemberListModal
          open={showMemberListModal}
          onClose={() => setShowMemberListModal(false)}
          group={selectedGroup}
          onRemoveMember={handleRemoveMember}
          onEditMember={handleOpenEditMember}
        />
      )}

      {selectedGroup && (
        <ViewBalancesModal
          open={showBalancesModal}
          onClose={() => setShowBalancesModal(false)}
          group={selectedGroup}
          invoices={groupInvoices}
        />
      )}
    </div>
  );
}