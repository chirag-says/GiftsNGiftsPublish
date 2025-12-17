import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineSparkles } from 'react-icons/hi2';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import 'swiper/css';
import 'swiper/css/pagination';

const personas = [
  {
    id: 1,
    name: 'For the Daughter',
    tagline: 'Traditional jewelry and keepsakes for your beloved beti',
    image:
      'https://images.unsplash.com/photo-1594736797933-d0acc2401915?auto=format&fit=crop&w=900&q=80',
    category: 'Family',
    color: 'from-pink-400 to-rose-500',
    icon: '👧',
    brands: ['Tanishq', 'Kalyan Jewellers', 'Malabar Gold'],
  },
  {
    id: 2,
    name: 'For the Sister',
    tagline: 'Rakhi special gifts that celebrate your eternal bond',
    image:
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=80',
    category: 'Family',
    color: 'from-purple-400 to-pink-500',
    icon: '👩‍👧',
    brands: ['Chumbak', 'FabIndia', 'The Body Shop'],
  },
  {
    id: 3,
    name: 'Diwali Special',
    tagline: 'Premium diyas, sweets and festive treasures',
    image:
      'https://images.unsplash.com/photo-1608896657424-43e3b989e363?auto=format&fit=crop&w=900&q=80',
    category: 'Festival',
    color: 'from-orange-400 to-amber-500',
    icon: '🪔',
    brands: ['Haldiram\'s', 'Bikanervala', 'Mohanlal Sons'],
  },
  {
    id: 4,
    name: 'Wedding Trousseau',
    tagline: 'Heirloom pieces for the shaadi season',
    image:
      'https://images.unsplash.com/photo-1519221738753-56029e2c5513?auto=format&fit=crop&w=900&q=80',
    category: 'Occasion',
    color: 'from-red-400 to-pink-500',
    icon: '💑',
    brands: ['Sabyasachi', 'Manish Malhotra', 'Tarun Tahiliani'],
  },
  {
    id: 5,
    name: 'Housewarming',
    tagline: 'Traditional puja items and home décor for griha pravesh',
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
    category: 'Occasion',
    color: 'from-teal-400 to-cyan-500',
    icon: '🏠',
    brands: ['Good Earth', 'India Circus', 'FabIndia Home'],
  },
  {
    id: 6,
    name: 'Corporate Gifting',
    tagline: 'Premium corporate gifts that make an impression',
    image:
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=900&q=80',
    category: 'Corporate',
    color: 'from-blue-400 to-indigo-500',
    icon: '💼',
    brands: ['The Man Company', 'Bombay Shaving', 'Vahdam Teas'],
  },
];

const brandLogos = [
  'Tanishq', 'Kalyan Jewellers', 'Malabar Gold', 'Chumbak', 'FabIndia', 
  'The Body Shop', 'Haldiram\'s', 'Bikanervala', 'Mohanlal Sons', 'Sabyasachi',
  'Manish Malhotra', 'Tarun Tahiliani', 'Good Earth', 'India Circus', 'Bombay Shaving',
  'The Man Company', 'Vahdam Teas', 'Amrapali', 'Jaipur Rugs', 'Nicobar'
];

const PersonaCarousel = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [likedItems, setLikedItems] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState('All');

  const toggleLike = (id) => {
    const newLikedItems = new Set(likedItems);
    if (newLikedItems.has(id)) {
      newLikedItems.delete(id);
    } else {
      newLikedItems.add(id);
    }
    setLikedItems(newLikedItems);
  };

  const filteredPersonas = activeCategory === 'All' 
    ? personas 
    : personas.filter(persona => persona.category === activeCategory);

  return (
    <section className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-10 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-200 rounded-full filter blur-3xl opacity-20"></div>
      
      <div className="relative mx-auto w-11/12 max-w-7xl">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div className="relative">
            <div className="absolute -left-2 -top-2 text-3xl text-orange-300">
              <HiOutlineSparkles />
            </div>
            <p className="text-sm uppercase tracking-[0.3em] text-orange-700 font-medium">Shop by emotion</p>
            <h2 className="mt-1 text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-serif">
              Who are you gifting today?
            </h2>
            <div className="mt-2 h-1 w-20 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
          </div>

          <div className="flex gap-3">
            <button
              ref={prevRef}
              aria-label="Previous"
              className="rounded-full bg-orange-500 text-white border-2 border-orange-600 p-3 transition hover:bg-orange-600 hover:scale-105 shadow-md"
            >
              <HiOutlineArrowLeft />
            </button>
            <button
              ref={nextRef}
              aria-label="Next"
              className="rounded-full bg-orange-500 text-white border-2 border-orange-600 p-3 transition hover:bg-orange-600 hover:scale-105 shadow-md"
            >
              <HiOutlineArrowRight />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['All', 'Family', 'Festival', 'Occasion', 'Corporate'].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                activeCategory === category
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-orange-600 border border-orange-200 hover:border-orange-400'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Carousel */}
        <div className="relative">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            loop
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            pagination={{ 
              clickable: true,
              bulletClass: 'swiper-pagination-bullet',
              bulletActiveClass: 'swiper-pagination-bullet-active',
            }}
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 2.5 },
              1024: { slidesPerView: 3 },
            }}
            onInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }}
            className="pb-12"
          >
            {filteredPersonas.map((persona) => (
              <SwiperSlide key={persona.id}>
                <article className="group relative h-[320px] md:h-[340px] overflow-hidden rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl border border-orange-100">
                  {/* Image */}
                  <img
                    src={persona.image}
                    alt={persona.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${persona.color} from-black/85 via-black/55 to-transparent`} />

                  {/* Like Button */}
                  <button
                    onClick={() => toggleLike(persona.id)}
                    aria-label="Like this category"
                    className={`absolute top-4 right-4 rounded-full bg-white/80 backdrop-blur-sm p-2.5 transition-all hover:scale-110 shadow-md ${likedItems.has(persona.id) ? 'text-red-500' : 'text-gray-400'}`}
                  >
                    <FiHeart className={likedItems.has(persona.id) ? 'fill-current' : ''} />
                  </button>

                  {/* Content */}
                  <div className="relative flex h-full flex-col justify-between p-5 text-white">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{persona.icon}</span>
                        <span className="text-xs uppercase tracking-[0.2em] bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                          {persona.category}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold mb-1">{persona.name}</h3>
                      <p className="text-sm text-white/90 mb-4 max-w-xs">
                        {persona.tagline}
                      </p>
                      
                      <button className="flex items-center gap-2 w-fit rounded-full bg-white/95 px-5 py-2 text-[0.7rem] uppercase tracking-[0.3em] text-orange-700 font-semibold transition-all hover:bg-orange-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                        <FiShoppingBag className="text-base" />
                        Explore
                      </button>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        
        {/* Brand Logo Loop */}
        <div className="mt-12 mb-6">
          <h3 className="text-center text-lg font-semibold text-gray-800 mb-6">Featured Indian Brands</h3>
          <div className="relative overflow-hidden">
            <div className="flex animate-loop-logos">
              {brandLogos.map((brand, index) => (
                <div key={index} className="flex-shrink-0 w-32 h-16 mx-4 flex items-center justify-center bg-white rounded-xl shadow border border-orange-100 px-3">
                  <span className="text-sm font-semibold text-gray-700 text-center">{brand}</span>
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {brandLogos.map((brand, index) => (
                <div key={`duplicate-${index}`} className="flex-shrink-0 w-32 h-16 mx-4 flex items-center justify-center bg-white rounded-xl shadow border border-orange-100 px-3">
                  <span className="text-sm font-semibold text-gray-700 text-center">{brand}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 italic">
            Discover curated gifts for every Indian relationship and occasion
          </p>
        </div>
      </div>
      
      <style jsx>{`
        .swiper-pagination-bullet {
          background-color: rgba(251, 146, 60, 0.5);
          opacity: 1;
          width: 8px;
          height: 8px;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
        
        .swiper-pagination-bullet-active {
          background-color: #fb923c;
          width: 24px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
        
        @keyframes loop-logos {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-loop-logos {
          animation: loop-logos 30s linear infinite;
        }
        
        .animate-loop-logos:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default PersonaCarousel;