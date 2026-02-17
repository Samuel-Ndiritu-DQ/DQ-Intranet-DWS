import { useAuth } from '@/communities/contexts/AuthProvider';
import { Button } from '@/communities/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/communities/components/ui/card';
import { LogIn } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export function LoginForm({
  onSuccess,
  compact = false
}: LoginFormProps) {
  const { signIn } = useAuth();

  const handleSignIn = () => {
    signIn();
    // onSuccess will be called after Azure AD redirect completes
    if (onSuccess) {
      // Note: This won't execute immediately due to redirect, but Azure AD will handle the flow
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 100);
    }
  };

  if (compact) {
    return (
      <Button 
        onClick={handleSignIn} 
        className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity h-10"
      >
        <LogIn className="h-4 w-4 mr-2" />
        Sign In with Microsoft
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-[var(--shadow-elegant)] border-border/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Welcome Back
        </CardTitle>
        <CardDescription>
          Sign in with your Microsoft account to access Communities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={handleSignIn} 
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-[var(--shadow-soft)]"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In with Microsoft
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}