import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { EventType, AuthenticationResult } from '@azure/msal-browser';
import { defaultLoginRequest, signupRequest } from '../../services/auth/msal';
import { supabaseClient } from '../../lib/supabaseClient';
import { toast } from 'sonner';
import { azureIdToUuid } from '../utils/azureIdToUuid';

interface User {
  id: string;
  email: string;
  username: string | null;
  role: string | null;
  avatar_url: string | null;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => void; // Redirects to Azure AD login
  signUp: () => void; // Redirects to Azure AD signup
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children
}: {
  children: ReactNode;
}) {
  // Users are already authenticated via main app's ProtectedRoute
  // So we can be optimistic about authentication state
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // Start as false - don't block UI
  const [emailOverride, setEmailOverride] = useState<string | undefined>(undefined);
  const viteEnv = (import.meta as any).env as Record<string, string | undefined>;
  const enableGraphFallback = (viteEnv?.VITE_MSAL_ENABLE_GRAPH_FALLBACK || viteEnv?.NEXT_PUBLIC_MSAL_ENABLE_GRAPH_FALLBACK) === 'true';

  // Ensure active account is set for convenience
  useEffect(() => {
    const active = instance.getActiveAccount();
    if (!active && accounts.length === 1) {
      instance.setActiveAccount(accounts[0]);
    }
  }, [instance, accounts]);

  // Simple fire-and-forget sync - directly upsert user data from Azure profile
  const syncUserQuietly = useCallback(async (account: any) => {
    if (!account) return;

    const claims = account.idTokenClaims as any;
    const email =
      claims?.emails?.[0] ||
      claims?.email ||
      claims?.preferred_username ||
      account.username ||
      '';
    const name = account.name || claims?.name || '';
    const azureId = account.localAccountId || account.homeAccountId;

    if (!email || !azureId) return;

    const userId = azureIdToUuid(azureId);
    const username = name || email.split('@')[0];

    // Direct upsert - no RPC function needed
    try {
      await supabaseClient
        .from('users_local')
        .upsert({
          id: userId,
          email: email,
          name: name,
          username: username,
          azure_id: azureId,
          password: 'AZURE_AD_AUTHENTICATED',
          role: 'member',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
    } catch (error) {
      // Silent fail - sync will retry on next login
    }
  }, []);

  // Ensure active account is set on successful login/redirect events
  useEffect(() => {
    const callbackId = instance.addEventCallback((event) => {
      if (
        event.eventType === EventType.LOGIN_SUCCESS ||
        event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS ||
        event.eventType === EventType.SSO_SILENT_SUCCESS
      ) {
        const payload = event.payload as AuthenticationResult | null;
        const account = payload?.account;
        if (account) {
          instance.setActiveAccount(account);
          syncUserQuietly(account); // Fire and forget
        }
      }
    });
    return () => {
      if (callbackId) instance.removeEventCallback(callbackId);
    };
  }, [instance, syncUserQuietly]);

  // Load user profile from users_local table using UUID generated from Azure AD ID
  const loadUserProfile = useCallback(async (azureId: string) => {
    try {
      // Generate UUID from Azure AD ID (must match database trigger logic)
      const userId = azureIdToUuid(azureId);
      
      // Get user profile from users_local table using the UUID
      const { data: profile, error } = await supabaseClient
        .from('users_local')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && profile && typeof profile === 'object' && 'id' in profile) {
        const userData: User = {
          id: (profile as any).id, // This is the UUID
          email: (profile as any).email || '',
          username: (profile as any).username,
          role: (profile as any).role,
          avatar_url: (profile as any).avatar_url,
          name: (profile as any).username || (profile as any).email?.split('@')[0] || ''
        };
        setUser(userData);
        setLoading(false);
        return;
      } else {
        // User will be synced automatically by database trigger when they authenticate
        // But we should still update the user object with the UUID
        const userId = azureIdToUuid(azureId);
        setUser(prev => prev ? { ...prev, id: userId } : null);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  }, []);

  // Get Azure AD user info and load profile
  // Since users are already authenticated via main app's ProtectedRoute,
  // we can immediately create user object and load profile in background
  useEffect(() => {
    const account = instance.getActiveAccount() || accounts[0];
    
    if (account) {
      const azureId = account.localAccountId || account.homeAccountId;
      if (azureId) {
        // Generate UUID from Azure AD ID (must match database)
        const userId = azureIdToUuid(azureId);
        
        // Immediately create user object from Azure AD data - don't wait for database
        const claims = account.idTokenClaims as any;
        const email = claims?.emails?.[0] || claims?.email || claims?.preferred_username || account.username || '';
        const name = account.name || claims?.name || email.split('@')[0] || '';
        
        // Set user immediately with UUID (not raw Azure ID) so UI is not blocked
        setUser({
          id: userId, // Use UUID, not raw azureId
          email,
          username: name,
          role: null,
          avatar_url: null,
          name
        });
        setLoading(false);
        
        // Sync user and load full profile from database in background (non-blocking)
        syncUserQuietly(account);
        loadUserProfile(azureId);
      }
    } else {
      // No account - but since main app requires auth via ProtectedRoute, this shouldn't happen
      // Still set loading to false to not block UI
      setUser(null);
      setLoading(false);
    }
  }, [accounts, instance, syncUserQuietly, loadUserProfile]);


  useEffect(() => {
    // Since main app already requires authentication via ProtectedRoute,
    // users are always authenticated when they reach Communities
    // Don't block UI with loading state
    setLoading(false);
  }, [isAuthenticated, accounts, instance]);

  // Heuristic to detect synthetic/UPN-like emails we want to improve
  const looksSynthetic = useCallback((value?: string) => {
    if (!value) return true;
    const onMs = /@.*\.onmicrosoft\.com$/i.test(value);
    const guidLocal = /^[0-9a-f-]{36}@/i.test(value) || value.includes('#EXT#');
    return onMs || guidLocal;
  }, []);

  // Optional: resolve better email via Microsoft Graph if configured and necessary
  useEffect(() => {
    if (!enableGraphFallback) return;
    const account = instance.getActiveAccount() || accounts[0];
    if (!account) return;
    const claims = account.idTokenClaims as any;
    const current = (claims?.emails?.[0] || claims?.email || claims?.preferred_username || account.username) as string | undefined;
    if (current && !looksSynthetic(current)) return;

    let cancelled = false;
    (async () => {
      try {
        const result = await instance.acquireTokenSilent({
          account,
          scopes: ['User.Read']
        });
        const r = await fetch('https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName,otherMails', {
          headers: { Authorization: `Bearer ${result.accessToken}` }
        });
        if (!r.ok) return;
        const me = await r.json();
        const resolved: string | undefined = me.mail || (me.otherMails && me.otherMails[0]) || me.userPrincipalName || current;
        if (!cancelled && resolved && !looksSynthetic(resolved)) {
          setEmailOverride(resolved);
        }
      } catch (e) {
        // ignore failures silently; fallback remains
      }
    })();
    return () => { cancelled = true; };
  }, [accounts, instance, enableGraphFallback, looksSynthetic]);

  const signIn = useCallback(() => {
    instance.loginRedirect({
      ...defaultLoginRequest
    });
  }, [instance]);

  // For Entra ID, signup is the same as login
  const signUp = useCallback(() => {
    instance.loginRedirect({
      ...signupRequest,
      // Tag this flow so we can route to onboarding after redirect
      state: 'ej-signup'
    });
  }, [instance]);

  const signOut = useCallback(() => {
    const account = instance.getActiveAccount() || accounts[0];
    instance.logoutRedirect({ account: account });
    setUser(null);
    toast.success('Signed out successfully');
  }, [instance, accounts]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user && isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
