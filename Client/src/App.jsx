import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

// Static imports for components that should load immediately (above the fold)
import Header from "./Components/Home/Header/Header.jsx";
import Footer from "./Components/Home/Footer/Footer.jsx";
import Loading from "./Components/Loading/Loading.jsx";
import ScrollToTop from "./Components/ScrollToTop.jsx";
import ErrorBoundary from "./Components/ErrorBoundary/ErrorBoundary.jsx";
import StateSlider from "./Components/Home/HomePageSlider/StateSlider.jsx";
import CollectionPage from "./Components/Home/CollectionPage.jsx";
import ArtisanStorySection from "./Components/Home/Artician/ArtisanStorySection.jsx";

// ============================================
// PERFORMANCE: Lazy-loaded components (code splitting)
// These components are loaded on-demand when navigated to
// This significantly reduces the initial bundle size
// ============================================

// Main pages
const Home = lazy(() => import("./Components/Home/HomePage.jsx"));
const ProductList = lazy(() => import("./Components/ProductList/ProductList.jsx"));
const ProductDetail = lazy(() => import("./Components/ProductDetalis/ProductDetail.jsx"));

// Auth pages
const Login = lazy(() => import("./Components/LoginPage/Login.jsx"));
const Emailverify = lazy(() => import("./Components/LoginPage/Emailverify.jsx"));
const Reset_pass = lazy(() => import("./Components/LoginPage/Reset_pass.jsx"));

// User account pages
const MyProfile = lazy(() => import("./Components/My Profile/MyProfile.jsx"));
const Orders = lazy(() => import("./Components/Orders/Orders.jsx"));
const WishlistPage = lazy(() => import("./Components/Wish List/WishlistPage.jsx"));

// Cart & Checkout pages
const Cartpage = lazy(() => import("./Components/Cart Page/Cartpage.jsx"));
const B2BCart = lazy(() => import("./Components/Cart Page/B2BCart.jsx"));
const AddAddress = lazy(() => import("./Components/BillingPage/AddAddress.jsx"));
const OrderSummery = lazy(() => import("./Components/Order Summery/OrderSummery.jsx"));
const PaymentSuccess = lazy(() => import("./Components/Order Summery/PaymentSuccess.jsx"));
const OrderSuccess = lazy(() => import("./Components/Order Summery/OrderSuccess.jsx"));
const OrderConfirmation = lazy(() => import("./Components/Order Summery/OrderConfirmation.jsx"));
const B2BCheckout = lazy(() => import("./Components/Checkout/B2BCheckout.jsx"));

// Other pages
const Feedback = lazy(() => import("./Components/Feedback/Feedback.jsx"));
const SearchResultsPage = lazy(() => import("./Components/Home/Header/Navigations/SearchResultsPage.jsx"));
const OrderTracking = lazy(() => import("./Components/Home/Header/TopStrip/OrderTracking.jsx"));
const HelpCenter = lazy(() => import("./Components/Home/Header/TopStrip/HelpCenter.jsx"));
const ContactUs = lazy(() => import("./Components/Home/Header/TopStrip/ContactUs.jsx"));

// Legal/Info pages (lowest priority, rarely visited)
const Support_Policy = lazy(() => import("./Components/Home/Footer/Support_Policy.jsx"));
const TermsAndConditions = lazy(() => import("./Components/Home/Footer/Terms&Condition.jsx"));
const PrivacyPolicy = lazy(() => import("./Components/Home/Footer/PrivacyPolicy.jsx"));
const ShippingInfo = lazy(() => import("./Components/Home/Footer/Shippinginfo.jsx"));
const TermsOfUse = lazy(() => import("./Components/Home/Footer/TermOfUSe.jsx"));
const FAQs = lazy(() => import("./Components/Home/Footer/FAQs.jsx"));
const Desclaimer = lazy(() => import("./Components/Home/Footer/Desclaimer.jsx"));
const BulkOrders = lazy(() => import("./Components/Home/Footer/BulkOrders.jsx"));
const RefundPlicy = lazy(() => import("./Components/Home/Footer/RefundPolicy.jsx"));

// Error page
const ErrorPage = lazy(() => import("./Components/ErrorPage/ErrorPage.jsx"));

// Chatbot (load after main content)
const ChatWidget = lazy(() => import("./Components/Chatbot/ChatWidget.jsx"));

const ShopByOccasionPage = lazy(() => import("./Components/Occasion/ShopByOccasionPage.jsx"));
const OccasionLandingPage = lazy(() => import('./Components/Occasion/OccasionLandingPage.jsx'));
const GiftForLandingPage = lazy(() => import('./Components/GiftFor/GiftForLandingPage.jsx'));
const GiftFinderQuiz = lazy(() => import("./Components/Occasion/GiftFinderQuiz.jsx"));
const ProductComparison = lazy(() => import("./Components/Occasion/ProductComparison.jsx"));
const BulkQuoteRequest = lazy(() => import("./Components/Occasion/BulkQuoteRequest.jsx"));

// Artisan pages
const ArtisansPage = lazy(() => import("./Components/Artisan/ArtisansPage.jsx"));
const ArtisanProfile = lazy(() => import("./Components/Artisan/ArtisanProfile.jsx"));

// Craft pages
const ShopByCraftPage = lazy(() => import("./Components/Craft/ShopByCraftPage.jsx"));
const CraftCollectionPage = lazy(() => import("./Components/Craft/CraftCollectionPage.jsx"));

// State pages
const StateCollectionPage = lazy(() => import("./Components/State/StateCollectionPage.jsx"));
const AllStatesPage = lazy(() => import("./Components/State/AllStatesPage.jsx"));

// B2B Order Confirmation
const B2BOrderConfirmation = lazy(() => import("./Components/Order Summery/B2BOrderConfirmation.jsx"));

// WhatsApp Button (global component)
import WhatsAppButton from "./Components/WhatsAppButton/WhatsAppButton.jsx";

// Trust Bar
import TrustBar from "./Components/Home/TrustBar/TrustBar.jsx";

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Header />

      {/* PERFORMANCE: Suspense wrapper for lazy-loaded routes */}
      <main className="pt-[70px] lg:pt-[140px] ">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" exact={true} element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/email-verify" element={<Emailverify />} />
            <Route path="/myProfile" element={<MyProfile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/productlist" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cartlist" element={<Cartpage />} />
            <Route path="/addaddress" element={<AddAddress />} />
            <Route path="/ordersummery" element={<OrderSummery />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/search-results" element={<SearchResultsPage />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/support-policy" element={<Support_Policy />} />
            <Route path="/shipping-info" element={<ShippingInfo />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/order-tracking" element={<OrderTracking />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/disclaimer" element={<Desclaimer />} />
            <Route path="/bulk-orders" element={<BulkOrders />} />
            <Route path="/refund-policy" element={<RefundPlicy />} />
            <Route path="/reset-password" element={<Reset_pass />} />
            <Route path="/stop-by-state" element={<StateSlider />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/artician" element={<ArtisanStorySection />} />

            {/* Shop by Occasion Routes */}
            <Route path="/shop-by-occasion" element={<ShopByOccasionPage />} />
            <Route path="/occasion/:slug" element={<OccasionLandingPage />} />

            {/* Gift For Routes */}
            <Route path="/gift-for/:slug" element={<GiftForLandingPage />} />
            <Route path="/gift-finder" element={<GiftFinderQuiz />} />
            <Route path="/compare" element={<ProductComparison />} />
            <Route path="/bulk-quote" element={<BulkQuoteRequest />} />

            {/* B2B Routes */}
            <Route path="/b2b-cart" element={<B2BCart />} />
            <Route path="/b2b-checkout" element={<B2BCheckout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/b2b-order-confirmation/:orderId" element={<B2BOrderConfirmation />} />

            {/* Artisan Routes */}
            <Route path="/artisans" element={<ArtisansPage />} />
            <Route path="/artisan/:slug" element={<ArtisanProfile />} />

            {/* Craft Routes */}
            <Route path="/shop-by-craft" element={<ShopByCraftPage />} />
            <Route path="/craft/:slug" element={<CraftCollectionPage />} />

            {/* State Routes */}
            <Route path="/states" element={<AllStatesPage />} />
            <Route path="/state/:slug" element={<StateCollectionPage />} />

            {/* Direct relationship routes (e.g., /daughter, /grandmother, /friend) */}
            {/* These catch any single-segment path and route to GiftForLandingPage */}
            <Route path="/daughter" element={<GiftForLandingPage />} />
            <Route path="/son" element={<GiftForLandingPage />} />
            <Route path="/mother" element={<GiftForLandingPage />} />
            <Route path="/father" element={<GiftForLandingPage />} />
            <Route path="/brother" element={<GiftForLandingPage />} />
            <Route path="/sister" element={<GiftForLandingPage />} />
            <Route path="/wife" element={<GiftForLandingPage />} />
            <Route path="/husband" element={<GiftForLandingPage />} />
            <Route path="/friend" element={<GiftForLandingPage />} />
            <Route path="/colleague" element={<GiftForLandingPage />} />
            <Route path="/boyfriend" element={<GiftForLandingPage />} />
            <Route path="/girlfriend" element={<GiftForLandingPage />} />
            <Route path="/grandparents" element={<GiftForLandingPage />} />
            <Route path="/grandmother" element={<GiftForLandingPage />} />
            <Route path="/grandfather" element={<GiftForLandingPage />} />
            <Route path="/uncle" element={<GiftForLandingPage />} />
            <Route path="/aunt" element={<GiftForLandingPage />} />
            <Route path="/couple" element={<GiftForLandingPage />} />
            <Route path="/couples" element={<GiftForLandingPage />} />
            <Route path="/in-laws" element={<GiftForLandingPage />} />
            <Route path="/boss" element={<GiftForLandingPage />} />
            <Route path="/teacher" element={<GiftForLandingPage />} />
            <Route path="/kids" element={<GiftForLandingPage />} />
            <Route path="/teens" element={<GiftForLandingPage />} />
            <Route path="/men" element={<GiftForLandingPage />} />
            <Route path="/women" element={<GiftForLandingPage />} />
            <Route path="/parents" element={<GiftForLandingPage />} />
            <Route path="/newlyweds" element={<GiftForLandingPage />} />
            <Route path="/new-parents" element={<GiftForLandingPage />} />
            <Route path="/pet-lovers" element={<GiftForLandingPage />} />
            <Route path="/anyone" element={<GiftForLandingPage />} />
            <Route path="/best-friend" element={<GiftForLandingPage />} />

            {/* 404 Catch-all - MUST be last */}
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Suspense>
      </main>

      {/* Trust Bar (before footer) */}
      <TrustBar />

      <Footer />

      {/* PERFORMANCE: Chatbot loaded lazily after main content */}
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>

      {/* WhatsApp Support Button */}
      <WhatsAppButton />
    </ErrorBoundary>
  );
}

export default App;
