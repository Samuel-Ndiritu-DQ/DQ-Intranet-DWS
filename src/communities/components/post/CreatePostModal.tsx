import React, { useState } from 'react';
import { useAuth } from '@/communities/contexts/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/communities/components/ui/dialog';
import { InlineComposer } from './InlineComposer';
import { useCommunityMembership } from '@/communities/hooks/useCommunityMembership';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: string;
  onPostCreated?: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  open,
  onOpenChange,
  communityId,
  onPostCreated
}) => {
  const { user } = useAuth();
  const { isMember } = useCommunityMembership(communityId);

  const handlePostCreated = () => {
    // Trigger parent refresh callback
    onPostCreated?.();
    // Close the modal after a short delay to allow the success toast to show
    setTimeout(() => {
      onOpenChange(false);
    }, 100);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onOpenChange(false);
      return;
    }

    // Users are already authenticated via main app's ProtectedRoute
    // If user is not available yet, it's just loading - allow modal to open
    // The InlineComposer will handle the actual post creation
    onOpenChange(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create a Post</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {/* Users are already authenticated via main app - show composer directly */}
            {user ? (
              <InlineComposer
                communityId={communityId}
                isMember={isMember}
                onPostCreated={handlePostCreated}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Loading user information...</p>
                <p className="text-sm text-gray-500">If this persists, please refresh the page.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* SignInModal removed - users are already authenticated via main app */}
    </>
  );
};

