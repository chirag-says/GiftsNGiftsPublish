import React, { useEffect, useState } from 'react';
import { HiOutlineArrowLeft, HiOutlineArrowRight } from 'react-icons/hi2';
import { FiHeart, FiMapPin, FiStar } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi';
import artBack from '../../../assets/artback.png';

const artisans = [
    {
        id: 1,
        name: 'Anaya Kapoor',
        craft: 'Brass Inlay Artisan',
        location: 'Jaipur, Rajasthan',
        story: 'Anaya comes from a family of meenakari artists who have been practicing this craft for generations. She blends traditional techniques with contemporary designs, creating pieces that tell stories of Rajasthan\'s royal heritage.',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80',
        specialty: 'Meenakari',
        years: '15+ years',
    },
    {
        id: 2,
        name: 'Rehaan Dey',
        craft: 'Tea Sommelier',
        location: 'Darjeeling, West Bengal',
        story: 'Rehaan grew up among the tea gardens of Darjeeling, learning the delicate art of tea cultivation from his grandfather. He now creates exclusive blends that capture the essence of Himalayan terroir.',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
        specialty: 'Monsoon Teas',
        years: '10+ years',
    },
    {
        id: 3,
        name: 'Meera Bansal',
        craft: 'Textile Weaver',
        location: 'Kutch, Gujarat',
        story: 'Meera belongs to a community of weavers who have preserved the ancient art of Kutch weaving for centuries. Her work features intricate patterns inspired by the desert landscape and traditional folk tales.',
        image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=500&q=80',
        specialty: 'Bandhani',
        years: '20+ years',
    },
    {
        id: 4,
        name: 'Saira Joseph',
        craft: 'Botanical Perfumer',
        location: 'Cochin, Kerala',
        story: 'Saira learned the ancient art of attar-making from her mother, who was a renowned perfumer in their community. She sources ingredients from Kerala\'s spice gardens to create fragrances that evoke memories of India.',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80',
        specialty: 'Natural Attars',
        years: '12+ years',
    },
    {
        id: 5,
        name: 'Kabir Thomas',
        craft: 'Leather Artisan',
        location: 'Pondicherry',
        story: 'Kabir combines French colonial leather techniques with traditional Indian craftsmanship. His workshop, passed down through three generations, creates leather goods that age beautifully with time.',
        image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=500&q=80',
        specialty: 'Hand-bound Journals',
        years: '25+ years',
    },
];

const ArtisanCarousel = () => {
    const [index, setIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const active = artisans[index];

    useEffect(() => {
        const timer = setInterval(() => {
            handleNext();
        }, 6000);
        return () => clearInterval(timer);
    }, [index]);

    const handlePrev = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
        setIndex((prev) => (prev === 0 ? artisans.length - 1 : prev - 1));
        setIsLiked(false);
    };

    const handleNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
        setIndex((prev) => (prev + 1) % artisans.length);
        setIsLiked(false);
    };

    const toggleLike = () => {
        setIsLiked(!isLiked);
    };

    return (
        <section
            className="relative py-10 overflow-hidden"
            style={{ backgroundImage: `url(${artBack})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/90 via-amber-50/85 to-yellow-50/90" aria-hidden></div>
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-200 rounded-full filter blur-3xl opacity-20"></div>
            
            <div className="relative mx-auto w-11/12 max-w-6xl">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                    <div className="relative">
                        <div className="absolute -left-2 -top-2 text-3xl text-orange-300">
                            <HiOutlineSparkles />
                        </div>
                        <p className="text-sm uppercase tracking-[0.3em] text-orange-700 font-medium">Artisan spotlight</p>
                        <h2 className="mt-1 text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-serif">
                            Craftsmanship that tells a story
                        </h2>
                        <div className="mt-2 h-1 w-20 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
                    </div>
                    
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handlePrev}
                            aria-label="Previous artisan"
                            className="rounded-full bg-white/80 backdrop-blur-sm border-2 border-orange-200 p-3 text-orange-600 transition-all hover:bg-orange-100 hover:scale-110 shadow-md"
                        >
                            <HiOutlineArrowLeft />
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            aria-label="Next artisan"
                            className="rounded-full bg-white/80 backdrop-blur-sm border-2 border-orange-200 p-3 text-orange-600 transition-all hover:bg-orange-100 hover:scale-110 shadow-md"
                        >
                            <HiOutlineArrowRight />
                        </button>
                    </div>
                </div>

                <article className={`relative bg-white/90 backdrop-blur-sm rounded-3xl border border-orange-100 p-8 shadow-xl transition-all duration-500 ${isAnimating ? 'opacity-80 scale-95' : 'opacity-100 scale-100'}`}>
                    <button
                        type="button"
                        onClick={toggleLike}
                        aria-label="save artisan"
                        className={`absolute right-8 top-8 rounded-full border-2 ${isLiked ? 'bg-red-50 border-red-300 text-red-500' : 'bg-white/80 border-orange-200 text-orange-400'} p-3 transition-all hover:scale-110 shadow-md`}
                    >
                        <FiHeart className={isLiked ? 'fill-current' : ''} />
                    </button>
                    
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="relative">
                            <div className="h-40 w-40 md:h-48 md:w-48 overflow-hidden rounded-full border-4 border-white shadow-xl">
                                <img src={active.image} alt={active.name} className="h-full w-full object-cover" loading="lazy" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-400 to-amber-400 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md">
                                {active.years}
                            </div>
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                <p className="text-xs uppercase tracking-[0.3em] text-orange-600 font-medium">Featured artisan</p>
                                <div className="flex items-center justify-center md:justify-start gap-1 text-orange-400">
                                    <FiStar className="fill-current" />
                                    <FiStar className="fill-current" />
                                    <FiStar className="fill-current" />
                                    <FiStar className="fill-current" />
                                    <FiStar className="fill-current" />
                                </div>
                            </div>
                            
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 font-serif">{active.name}</h3>
                            
                            <div className="flex items-center justify-center md:justify-start gap-2 mt-1 mb-4">
                                <p className="text-sm font-medium text-orange-600">{active.craft}</p>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center gap-1 text-gray-500">
                                    <FiMapPin className="text-xs" />
                                    <p className="text-sm">{active.location}</p>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <span className="inline-block bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-medium">
                                    Specialty: {active.specialty}
                                </span>
                            </div>
                            
                            <p className="text-gray-700 leading-relaxed mb-6">{active.story}</p>
                            
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <button
                                    type="button"
                                    className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-7 py-3 text-sm font-medium text-white transition-all hover:shadow-lg hover:scale-105"
                                >
                                    View their collection
                                </button>
                                
                                <div className="flex items-center gap-2">
                                    {artisans.map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setIndex(i)}
                                            className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-orange-400' : 'w-2 bg-orange-200'}`}
                                            aria-label={`Go to artisan ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
                
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 italic">
                        Discover the rich heritage of Indian craftsmanship through our curated artisans
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ArtisanCarousel;