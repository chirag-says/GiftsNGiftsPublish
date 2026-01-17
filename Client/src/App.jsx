import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

// Static imports for components that should load immediately (above the fold)
import Header from "./Components/Home/Header/Header.jsx";
import Footer from "./Components/Home/Footer/Footer.jsx";
import Loading from "./Components/Loading/Loading.jsx";
import ScrollToTop from "./Components/ScrollToTop.jsx";
import ErrorBoundary from "./Components/ErrorBoundary/ErrorBoundary.jsx";

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
const AddAddress = lazy(() => import("./Components/BillingPage/AddAddress.jsx"));
const OrderSummery = lazy(() => import("./Components/Order Summery/OrderSummery.jsx"));
const PaymentSuccess = lazy(() => import("./Components/Order Summery/PaymentSuccess.jsx"));
const OrderSuccess = lazy(() => import("./Components/Order Summery/OrderSuccess.jsx"));

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

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Header />

      {/* PERFORMANCE: Suspense wrapper for lazy-loaded routes */}
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" exact={true} element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/email-verify" element={<Emailverify />} />
          <Route path="/Reset_pass" element={<Reset_pass />} />
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
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Suspense>

      <Footer />

      {/* PERFORMANCE: Chatbot loaded lazily after main content */}
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
