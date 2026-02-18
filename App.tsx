'use client';

import { useState } from 'react';
import { GroupCard } from './components/group-card';
import { GroupHeader } from './components/group-header';
import { InvoiceTable } from './components/invoice-table';
import { AddInvoiceModal } from './components/add-invoice-modal';
import { InvoiceDetail } from './components/invoice-detail';
import { AddMemberModal } from './components/add-member-modal';
import { MemberListModal } from './components/member-list-modal';
import { CreateGroupModal } from './components/create-group-modal';
import { Button } from './components/ui/button';
import { Plus, Receipt, ArrowLeft } from 'lucide-react';
import { mockGroups, mockInvoices, mockMembers } from './lib/mock-data';
import { Invoice, Group, Member } from './types';


type View = 'dashboard' | 'group-detail' | 'invoice-detail';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [invoices, setInvoices] = useState(mockInvoices);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showMemberListModal, setShowMemberListModal] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [invoiceMode, setInvoiceMode] = useState<'view' | 'edit'>('view');

  const handleGroupClick = (groupId: string) => {
    setSelectedGroupId(groupId);
    setCurrentView('group-detail');
  };

  const handleCreateGroup = (group: Group) => {
    setGroups((prev) => [group, ...prev]);
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

  const handleSaveInvoice = (invoiceData: {
    merchant: string;
    date: string;
    total: number;
    items: any[];
  }) => {
    if (!selectedGroupId) return;

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
      createdAt: new Date(),
    };

    setInvoices([...invoices, newInvoice]);
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(
      invoices.map((inv) =>
        inv.id === updatedInvoice.id ? updatedInvoice : inv
      )
    );
    setCurrentView('group-detail');
    setSelectedInvoiceId(null);
  };

  const handleAddMember = (memberData: Omit<Member, 'id'>) => {
    if (!selectedGroupId) return;

    const newMember: Member = {
      id: `m-${Date.now()}`,
      ...memberData,
    };

    setGroups(
      groups.map((group) =>
        group.id === selectedGroupId
          ? { ...group, members: [...group.members, newMember] }
          : group
      )
    );
  };

  const handleRemoveMember = (memberId: string) => {
    if (!selectedGroupId) return;

    setGroups(
      groups.map((group) =>
        group.id === selectedGroupId
          ? {
            ...group,
            members: group.members.filter((m) => m.id !== memberId),
          }
          : group
      )
    );
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
              onDeleteInvoice={(id) => setInvoices(invoices.filter((inv) => inv.id !== id))}
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

      {selectedGroup && (
        <MemberListModal
          open={showMemberListModal}
          onClose={() => setShowMemberListModal(false)}
          group={selectedGroup}
          onRemoveMember={handleRemoveMember}
        />
      )}
    </div>
  );
}