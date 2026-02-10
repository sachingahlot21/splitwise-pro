import { Avatar, AvatarFallback } from './ui/avatar';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Group } from '../types';
import { Users } from 'lucide-react';

interface GroupCardProps {
  group: Group;
  onClick: () => void;
}

export function GroupCard({ group, onClick }: GroupCardProps) {
  const displayMembers = group.members.slice(0, 4);
  const remainingCount = group.members.length - 4;

  return (
    <Card
      className="hover:shadow-lg transition-all cursor-pointer border border-border/50 bg-card"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex-1 truncate">{group.name}</h3>
          {group.pendingBalance > 0 && (
            <Badge variant="secondary" className="shrink-0 bg-amber-50 text-amber-700 border-amber-200">
              Pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex -space-x-2">
              {displayMembers.map((member) => (
                <Avatar
                  key={member.id}
                  className="h-8 w-8 border-2 border-background"
                  style={{ backgroundColor: member.color + '20' }}
                >
                  <AvatarFallback style={{ backgroundColor: member.color, color: 'white' }}>
                    {member.avatar}
                  </AvatarFallback>
                </Avatar>
              ))}
              {remainingCount > 0 && (
                <Avatar className="h-8 w-8 border-2 border-background bg-muted">
                  <AvatarFallback className="text-xs">+{remainingCount}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between pt-2 border-t border-border/50">
          <div>
            <div className="text-xs text-muted-foreground">Total expenses</div>
            <div className="text-xl">${group.totalExpense.toFixed(2)}</div>
          </div>
          {group.pendingBalance > 0 && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Pending</div>
              <div className="text-amber-600">${group.pendingBalance.toFixed(2)}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
