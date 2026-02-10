import { Member, Group } from '../types';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Mail, Trash2 } from 'lucide-react';

interface MemberListModalProps {
  open: boolean;
  onClose: () => void;
  group: Group;
  onRemoveMember: (memberId: string) => void;
}

export function MemberListModal({
  open,
  onClose,
  group,
  onRemoveMember,
}: MemberListModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Group Members</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {group.members.length} member{group.members.length !== 1 ? 's' : ''} in{' '}
            {group.name}
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="h-10 w-10"
                        style={{ backgroundColor: member.color + '20' }}
                      >
                        <AvatarFallback
                          style={{ backgroundColor: member.color, color: 'white' }}
                        >
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>{member.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {member.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {group.members.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onRemoveMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
