import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "./components/Header";
import { MarketplaceRouter } from "./pages/marketplace/MarketplaceRouter";
import { CommunitiesRouter } from "./communities/CommunitiesRouter";
import { App } from "./App";

import MarketplaceDetailsPage from "./pages/marketplace/MarketplaceDetailsPage";
import LmsCourseDetailPage from "./pages/lms/LmsCourseDetailPage";
import LmsCourseReviewsPage from "./pages/lms/LmsCourseReviewsPage";

// Wrapper component to force remount on slug change
const LmsCourseDetailPageWrapper = () => {
  const { slug } = useParams<{ slug: string }>();
  return <LmsCourseDetailPage key={slug} />;
};
import LmsCourses from "./pages/LmsCourses";
import AssetLibraryPage from "./pages/assetLibrary";
import BlueprintsPage from "./pages/blueprints";
import DQAgileKPIsPage from "./pages/play/DQAgileKPIsPage";
import DashboardRouter from "./pages/dashboard/DashboardRouter";
import DiscoverDQ from "./pages/DiscoverDQ";
import ComingSoonPage from "./pages/ComingSoonPage";
import GrowthSectorsComingSoon from "./pages/GrowthSectorsComingSoon";
import SixXDProductsLanding from "./pages/6XDProductsLanding";
import NotFound from "./pages/NotFound";
import AdminGuidesList from "./pages/admin/guides/AdminGuidesList";
import GuideEditor from "./pages/admin/guides/GuideEditor";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import EventsPage from "./pages/events/EventsPage";
import { DWSChatProvider } from "./components/DWSChatProvider";
import ThankYou from "./pages/ThankYou";
import UnitProfilePage from "./pages/UnitProfilePage";
import WorkPositionProfilePage from "./pages/WorkPositionProfilePage";
import RoleProfilePage from "./pages/RoleProfilePage";
import WomenEntrepreneursPage from "./pages/WomenEntrepreneursPage";
import OnboardingLanding from "./pages/OnboardingLanding";
import { OnboardingJourney } from "./pages/OnboardingJourney";
import GHCLanding from "./pages/GHCLanding";
import SixXDLanding from "./pages/6XDLanding";
import DigitalAcceleratorsLanding from "./pages/DigitalAcceleratorsLanding";
import ChatBot from "./bot/ChatBot";

export function AppRouter() {

  const client = new ApolloClient({
    link: new HttpLink({
      uri: "https://9609a7336af8.ngrok-free.app/services-api",
    }), // <-- Use HttpLink
    cache: new InMemoryCache(),
  });

  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <AuthProvider>
          <DWSChatProvider>
            <ChatBot />
            <Routes>
              <Route path="/discover-dq" element={<DiscoverDQ />} />
              <Route path="/coming-soon" element={<ComingSoonPage />} />
              <Route path="/growth-sectors-coming-soon" element={<GrowthSectorsComingSoon />} />
              <Route path="/products" element={<SixXDProductsLanding />} />
              <Route path="/dq-products" element={<SixXDProductsLanding />} />
              <Route path="/knowledge-center/products" element={<SixXDProductsLanding />} />
              <Route path="/*" element={<App />} />
              <Route path="/courses/:itemId" element={<LmsCourseDetailPage />} />
              <Route path="/lms" element={<LmsCourses />} />
              <Route path="/lms/:slug/reviews" element={<LmsCourseReviewsPage />} />
              <Route
                path="/lms/:slug"
                element={<LmsCourseDetailPageWrapper />}
              />
              <Route path="/onboarding/welcome" element={<OnboardingLanding />} />
              <Route path="/onboarding/journey" element={<OnboardingJourney />} />
              <Route path="/ghc" element={<GHCLanding />} />
              <Route path="/6xd" element={<SixXDLanding />} />
              <Route path="/6xd-products" element={<SixXDProductsLanding />} />
              <Route path="/knowledge-center/products/digital-accelerators" element={<DigitalAcceleratorsLanding />} />
              <Route
                path="/onboarding/:itemId"
                element={
                  <MarketplaceDetailsPage
                    marketplaceType="onboarding"
                  />
                }
              />
              <Route
                path="/onboarding/:itemId/details"
                element={
                  <MarketplaceDetailsPage
                    marketplaceType="onboarding"
                  />
                }
              />
              <Route path="/marketplace/*" element={<MarketplaceRouter />} />
              {/* Admin - Guides CRUD */}
              <Route path="/admin/guides" element={<AdminGuidesList />} />
              <Route path="/admin/guides/new" element={<GuideEditor />} />
              <Route path="/admin/guides/:id" element={<GuideEditor />} />
              {/* Canonical and compatibility routes for Guides marketplace */}
              <Route path="/guides" element={<Navigate to="/marketplace/guides" replace />} />
              <Route path="/knowledge-hub" element={<Navigate to="/marketplace/guides" replace />} />
              <Route
                path="/dashboard/*"
                element={
                  // <ProtectedRoute>
                  <DashboardRouter />
                  // </ProtectedRoute>
                }
              />
              <Route path="/asset-library" element={<AssetLibraryPage />} />
              <Route path="/blueprints" element={<BlueprintsPage />} />
              <Route path="/blueprints/:projectId" element={<BlueprintsPage />} />
              <Route
                path="/blueprints/:projectId/:folderId"
                element={<BlueprintsPage />}
              />
              <Route path="/play/dq-agile-kpis" element={<DQAgileKPIsPage />} />
              <Route path="/thank-you" element={<ThankYou />} />
              {/* Redirect encoded leading-space path to canonical route */}
              <Route path="/%20marketplace/news" element={<Navigate to="/marketplace/news" replace />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/communities/*" element={<CommunitiesRouter />} />
              {/* Work Directory Routes */}
              <Route path="/work-directory/units/:slug" element={<UnitProfilePage />} />
              <Route path="/work-directory/positions/:slug" element={<WorkPositionProfilePage />} />
              {/* Role Profile Route */}
              <Route path="/roles/:slug" element={<RoleProfilePage />} />
              <Route
                path="/women-entrepreneurs"
                element={<WomenEntrepreneursPage />}
              />
              <Route path="/404" element={<NotFound />} />

              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </DWSChatProvider>
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
}
