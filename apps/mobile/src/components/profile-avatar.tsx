import { User } from '@/lib/icons';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type ProfileAvatarProps = {
  uri?: string | null;
  name?: string | null;
  /** Size utility, e.g. `size-12`; the person icon scales with `iconSize`. */
  className?: string;
  iconSize: number;
};

/** Profile photo; without one, or while it fails to load, a person icon on
 * the brand blue. */
export function ProfileAvatar({ uri, name, className, iconSize }: ProfileAvatarProps) {
  return (
    <Avatar alt={name || 'Membro Skillsy'} className={className}>
      {uri ? <AvatarImage source={{ uri }} /> : null}
      <AvatarFallback className="bg-primary">
        <User size={iconSize} className="text-primary-foreground" />
      </AvatarFallback>
    </Avatar>
  );
}
