'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface EditGroupModalProps {
  open: boolean;
  value: string;
  onClose: () => void;
  onSave: (groupName: string) => void;
}

export function EditGroupModal({ open, value, onClose, onSave }: EditGroupModalProps) {
  const [groupName, setGroupName] = useState(value);

  useEffect(() => {
    setGroupName(value);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    onSave(groupName.trim());
    onClose();
  };

  const handleCancel = () => {
    setGroupName(value);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Group Name</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              placeholder="Enter group name"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
