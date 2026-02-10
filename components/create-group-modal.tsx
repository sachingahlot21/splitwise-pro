'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Member, Group } from '../types';

const MEMBER_COLORS = [
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#06b6d4',
];

interface CreateGroupModalProps {
    open: boolean;
    onClose: () => void;
    onCreate: (group: Group) => void;
}

export function CreateGroupModal({
    open,
    onClose,
    onCreate,
}: CreateGroupModalProps) {
    const [groupName, setGroupName] = useState('');

    // new members only (not saved ones)
    const [members, setMembers] = useState<Member[]>([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const getInitials = (name: string) => {
        const parts = name.trim().split(' ');
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : name.slice(0, 2).toUpperCase();
    };

    const getNextColor = () => {
        const usedColors = members.map((m) => m.color);
        return MEMBER_COLORS.find((c) => !usedColors.includes(c)) || MEMBER_COLORS[0];
    };

    const handleAddMember = () => {
        if (!name.trim() || !email.trim()) return;

        setMembers((prev) => [
            ...prev,
            {
                id: `m-${Date.now()}`,
                name: name.trim(),
                email: email.trim(),
                avatar: getInitials(name),
                color: getNextColor(),
            },
        ]);

        setName('');
        setEmail('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('1')
        if (!groupName.trim() || members.length === 0) return;
        console.log('2')
        const newGroup: Group = {
            id: `g-${Date.now()}`,
            name: groupName.trim(),
            members,
            totalExpense: 0,        // ✅ required
            pendingBalance: 0,      // ✅ required
            createdAt: new Date(),  // ✅ required
        };

        console.log(newGroup)

        onCreate(newGroup);
        handleClose();
    };

    const handleClose = () => {
        setGroupName('');
        setMembers([]);
        setName('');
        setEmail('');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Group name */}
                    <div className="space-y-2">
                        <Label>Group Name</Label>
                        <Input
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="NYC Trip 2026"
                            required
                        />
                    </div>

                    {/* Add member */}
                    <div className="space-y-2">
                        <Label>Add Members</Label>

                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Member name"
                        />

                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="member@email.com"
                            type="email"
                        />

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleAddMember}
                            className="w-full"
                        >
                            + Add Member
                        </Button>
                    </div>

                    {/* Members list */}
                    {members.length > 0 && (
                        <div className="space-y-2">
                            {members.map((m) => (
                                <div
                                    key={m.id}
                                    className="flex items-center justify-between rounded-md border px-3 py-2"
                                >
                                    <div>
                                        <p className="text-sm font-medium">{m.name}</p>
                                        <p className="text-xs text-muted-foreground">{m.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Group</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
