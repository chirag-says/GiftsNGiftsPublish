import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectCoverflow } from 'swiper/modules';
import { LuStar, LuQuote } from 'react-icons/lu';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import testBack from '../../../assets/testback.png';

const testimonials = [
  {
    id: 1,
    quote: 'The Diwali gift box with personalized sweets and handcrafted diyas made our festival extra special. Everyone in the family cherished the thoughtful touch.',
    name: 'Priya Sharma',
    occasion: 'Diwali Celebration',
    avatar: '🪔'
  },
  {
    id: 2,
    quote: 'My brother loved the Rakhi gift bundle with the hand-painted Pichwai art and artisanal sweets. The traditional touch made our bond even stronger.',
    name: 'Ananya Verma',
    occasion: 'Raksha Bandhan',
    avatar: '🎀'
  },
  {
    id: 3,
    quote: 'Our wedding favors with miniature Madhubani paintings and traditional mithai boxes were the talk of the ceremony. Guests still mention them!',
    name: 'Kavya & Rohan',
    occasion: 'Indian Wedding',
    avatar: '💑'
  },
  {
    id: 4,
    quote: 'The custom-made brass puja thali with engraved mantras was the perfect housewarming gift. My parents perform daily puja with it now.',
    name: 'Arjun Mehta',
    occasion: 'Griha Pravesh',
    avatar: '🏠'
  },
  {
    id: 5,
    quote: 'The corporate Diwali hampers with artisanal crafts from different states showcased India\'s diversity. Our international clients were impressed!',
    name: 'Sanjana Kapoor',
    occasion: 'Corporate Gifting',
    avatar: '🎁'
  },
  {
    id: 6,
    quote: 'The personalized baby shower hamper with traditional silver jewelry and hand-embroidered blankets was exactly what my sister wanted.',
    name: 'Meera Iyer',
    occasion: 'Godh Bharai',
    avatar: '👶'
  }
];

const TestimonialsCarousel = () => {
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative py-8 overflow-hidden" style={{ backgroundImage: `url(${testBack})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/70 to-red-50/80" aria-hidden />
      
      <div className="relative mx-auto w-11/12 max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div className="relative bg-white/60 backdrop-blur-sm rounded-lg p-4 shadow-md">
            <div className="absolute -left-4 top-0 text-5xl text-orange-300">✨</div>
            <p className="text-sm uppercase tracking-[0.3em] text-orange-700 font-medium">Voices of Joy</p>
            <h2 className="mt-1 text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-serif">
              Celebrating Indian Traditions
            </h2>
            <div className="mt-2 h-1 w-20 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => swiperRef.current?.slidePrev()}
              className="rounded-full bg-orange-500 text-white border-2 border-orange-600 p-3 shadow-lg transition hover:bg-orange-600 hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => swiperRef.current?.slideNext()}
              className="rounded-full bg-orange-500 text-white border-2 border-orange-600 p-3 shadow-lg transition hover:bg-orange-600 hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div className="relative">
          <Swiper
            modules={[Autoplay, Pagination, EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            loop
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ 
              clickable: true,
              bulletClass: 'swiper-pagination-bullet',
              bulletActiveClass: 'swiper-pagination-bullet-active',
            }}
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="pb-12"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={testimonial.id}>
                <article className={`group relative h-full rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-xl transition-all duration-300 hover:shadow-2xl border-2 border-orange-200 ${index === activeIndex ? 'ring-2 ring-orange-400 ring-opacity-70' : ''}`}>
                  <div className="absolute top-3 right-3 text-6xl text-orange-100 opacity-50 group-hover:opacity-70 transition-opacity">
                    <LuQuote />
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <div className="text-4xl mr-3">{testimonial.avatar}</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{testimonial.name}</h3>
                      <p className="text-sm text-orange-600 font-medium">{testimonial.occasion}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 italic leading-relaxed mb-4 line-clamp-4">
                    "{testimonial.quote}"
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1 text-orange-400">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <LuStar key={`${testimonial.id}-${index}`} className="fill-current" />
                      ))}
                    </div>
                    <button className="text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors bg-white/70 px-3 py-1 rounded-full">
                      Read more →
                    </button>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        
        <div className="mt-4 text-center bg-white/60 backdrop-blur-sm rounded-lg p-3 shadow-md max-w-lg mx-auto">
          <p className="text-sm text-gray-700 italic font-medium">
            Join thousands celebrating India's rich traditions with our personalized gifts
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
        
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsCarousel;