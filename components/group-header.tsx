import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Plus, Settings, Users } from 'lucide-react';
import { Group } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface GroupHeaderProps {
  group: Group;
  onAddMember: () => void;
  onAddInvoice: () => void;
  onViewMembers?: () => void;
}

export function GroupHeader({ group, onAddMember, onAddInvoice, onViewMembers }: GroupHeaderProps) {
  return (
    <div className="bg-card border border-border/40 rounded-xl p-6 mb-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-3xl mb-2">{group.name}</h2>
          <div className="text-muted-foreground">
            {group.members.length} member{group.members.length !== 1 ? 's' : ''} · Total: $
            {group.totalExpense.toFixed(2)}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit group name</DropdownMenuItem>
            <DropdownMenuItem>View balances</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete group</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Members</span>
          </div>
          <div
            className="flex -space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onViewMembers}
          >
            {group.members.map((member) => (
              <Avatar
                key={member.id}
                className="h-10 w-10 border-2 border-background"
                style={{ backgroundColor: member.color + '20' }}
              >
                <AvatarFallback
                  style={{ backgroundColor: member.color, color: 'white' }}
                  title={member.name}
                >
                  {member.avatar}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={onAddMember}>
            <Plus className="h-4 w-4" />
            Add Member
          </Button>
        </div>

        <Button size="lg" className="gap-2" onClick={onAddInvoice}>
          <Plus className="h-5 w-5" />
          Add Invoice
        </Button>
      </div>
    </div>
  );
}