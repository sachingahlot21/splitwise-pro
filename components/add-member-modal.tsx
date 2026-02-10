'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Member } from '../types';

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (member: Omit<Member, 'id'>) => void;
  existingMembers: Member[];
}

const MEMBER_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#f97316',
  '#84cc16',
  '#a855f7',
];

export function AddMemberModal({
  open,
  onClose,
  onAdd,
  existingMembers,
}: AddMemberModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const getNextColor = () => {
    const usedColors = existingMembers.map((m) => m.color);
    return (
      MEMBER_COLORS.find((c) => !usedColors.includes(c)) || MEMBER_COLORS[0]
    );
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onAdd({
      name: name.trim(),
      email: email.trim(),
      avatar: getInitials(name),
      color: getNextColor(),
    });

    setName('');
    setEmail('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Group Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter member name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@example.com"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Add Member</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
