import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, ChefHat, Heart, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const userName = user?.name || 'Chef';
  const userEmail = user?.email || '';

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully'
    });
    navigate('/');
  };

  const stats = [
    { icon: ChefHat, label: 'Recipes Generated', value: '0' },
    { icon: Heart, label: 'Favorites', value: '0' },
    { icon: Sparkles, label: 'AI Credits', value: '∞' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="p-6 bg-gradient-dark">
        <div className="flex flex-col items-center text-center mb-8">
          <Avatar className="w-24 h-24 border-4 border-primary mb-4">
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold mb-1">{userName}</h1>
          <p className="text-muted-foreground">{userEmail}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-card p-4 rounded-xl text-center"
              >
                <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-6 space-y-4">
        <div className="bg-card rounded-xl overflow-hidden">
          <button className="w-full p-4 text-left hover:bg-muted transition-colors flex items-center justify-between">
            <span className="font-medium">Dietary Preferences</span>
            <span className="text-muted-foreground">→</span>
          </button>
          <div className="border-t border-border" />
          <button className="w-full p-4 text-left hover:bg-muted transition-colors flex items-center justify-between">
            <span className="font-medium">Cooking Level</span>
            <span className="text-muted-foreground">→</span>
          </button>
          <div className="border-t border-border" />
          <button className="w-full p-4 text-left hover:bg-muted transition-colors flex items-center justify-between">
            <span className="font-medium">Settings</span>
            <span className="text-muted-foreground">→</span>
          </button>
        </div>

        <div className="bg-card rounded-xl overflow-hidden">
          <button className="w-full p-4 text-left hover:bg-muted transition-colors flex items-center justify-between">
            <span className="font-medium">Help & Support</span>
            <span className="text-muted-foreground">→</span>
          </button>
          <div className="border-t border-border" />
          <button className="w-full p-4 text-left hover:bg-muted transition-colors flex items-center justify-between">
            <span className="font-medium">About Lovable</span>
            <span className="text-muted-foreground">→</span>
          </button>
        </div>

        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
