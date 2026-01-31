import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import NavCatSlider from "../Home/NavcatSlider/NavcatSlider.jsx";
import FreeShip from "../Home/Advertise/FreeShip.jsx";
import Adevert from "../Home/Advertise/Adevert.jsx";
import ProductSlider from "../Home/ProductSlider/Productslider.jsx";
import MiddelAds from "../Home/Advertise/MiddelAds.jsx";
import RelationSlider from "./RelationshipSlider/RelationSlider.jsx";
import StateSlider from "./HomePageSlider/StateSlider.jsx";
import ShopByOccasion from "./HomePageSlider/ShopByOccasion.jsx";
import CorporateGiftingCTA from "./HomePageSlider/CorporateGiftingCTA.jsx";

import assam from "../../assets/newimage/tea.png";
import state from "../../assets/newimage/state.png";
import one from '../../assets/roshni/main.png'
import two from '../../assets/roshni/main two.png'
import three from '../../assets/roshni/main three.png'
import four from '../../assets/roshni/main four.png'
import manipur from '../../assets/roshni/manipur.jpg'
import FeaturesSection from "./HomePageSlider/FeaturesSection.jsx";
import ArtisanStorySection from "./Artician/ArtisanStorySection.jsx";
import Banner from "./HomePageSlider/Banner.jsx";

function Home() {
  return (
    <>
      {/* Hero Banner */}
      <Banner />

      {/* Shop by State - Regional Identity */}
      <StateSlider />

      {/* Shop by Occasion - Key Feature */}
      <ShopByOccasion />

      {/* Corporate Gifting CTA - B2B Focus */}
      <CorporateGiftingCTA />

      {/* Trust & Features */}
      <FeaturesSection />

      {/* Relationship-Based Shopping */}
      <RelationSlider />

      {/* Category Navigation */}
      <NavCatSlider />

      {/* Featured Product Sliders */}
      <ProductSlider title="Birthday Gifts That Wow" />
      <ProductSlider title="Corporate Gift Favorites" />

      {/* Artisan Stories - Brand Value */}
      <ArtisanStorySection />
    </>
  );
}

export default Home;