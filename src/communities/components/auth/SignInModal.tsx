import { useAuth } from '@/communities/contexts/AuthProvider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/communities/components/ui/dialog';
import { Button } from '@/communities/components/ui/button';
import { LogIn } from 'lucide-react';

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

export function SignInModal({
  open,
  onOpenChange,
  onSuccess,
  title = "Sign In Required",
  description = "Please sign in with your Microsoft account to continue."
}: SignInModalProps) {
  const { signIn } = useAuth();

  const handleSignIn = () => {
    onOpenChange(false);
    // Redirect to Azure AD login
    signIn();
    // Note: onSuccess will be called after redirect completes
    if (onSuccess) {
      // This won't execute immediately due to redirect, but Azure AD handles the flow
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 100);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <p className="text-sm text-gray-600">
            You need to be signed in with your Microsoft account to perform this action.
          </p>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSignIn}
              className="bg-dq-navy hover:bg-[#13285A] text-white transition-colors"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In with Microsoft
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
