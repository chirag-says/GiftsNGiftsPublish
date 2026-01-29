import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Collapse } from 'react-collapse';
import { Checkbox, FormControlLabel, Slider, Button } from '@mui/material';
import { FaAngleUp, FaAngleDown } from 'react-icons/fa';
import { HiFilter } from 'react-icons/hi';

function LeftFilter({ onApplyFilters, initialCatId }) {
  const [isOpenCatFilter, setIsOpenCatFilter] = useState(true);
  const [isOpenPriceFilter, setIsOpenPriceFilter] = useState(true);
  const [isOpenDiscountFilter, setIsOpenDiscountFilter] = useState(true);
  
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);

  // --- Logic Kept Intact ---
  useEffect(() => {
    if (initialCatId) {
      setSelectedCategories([initialCatId]);
    }
  }, [initialCatId]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await api.get('/api/getcategories');
        setCategoryList(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategory();
  }, []);

  const handleApply = () => {
    onApplyFilters({
      selectedCategories,
      selectedDiscount,
      priceRange,
      sort: ""
    });
    setShowFilters(false);
  };

  const handleCategoryChange = (id) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleDiscountChange = (val) => {
    setSelectedDiscount(prev => (prev === val ? null : val));
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded border border-[#EDE3D2] shadow-sm">
      {/* Mobile Toggle Button - Matches Home Page Theme */}
      <div className="block lg:hidden mb-4">
        <button
          className="bg-[#322619] text-[#F9F6F0] px-6 py-3 rounded-full w-full font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
          onClick={() => setShowFilters(!showFilters)}
        >
          <HiFilter className="text-[#B58D2F]" />
          {showFilters ? "Close Selection" : "Refine Search"}
        </button>
      </div>

      <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-10`}>
        
        {/* Header - Boutique Style */}
        <div className="hidden lg:block pb-2">
           <h2 className="font-serif text-2xl font-bold text-[#322619] mb-2 tracking-tight">Filter </h2>
           <div className="w-16 h-1 bg-[#B58D2F]"></div>
        </div>

        {/* Category section */}
        <div className="pb-2">
          <div 
            className="flex justify-between items-center cursor-pointer group" 
            onClick={() => setIsOpenCatFilter(!isOpenCatFilter)}
          >
            <h3 className="font-serif text-lg font-bold text-[#322619] group-hover:text-[#B58D2F] transition-colors">Categories</h3>
            {isOpenCatFilter ? <FaAngleUp className="text-[#B58D2F]" /> : <FaAngleDown className="text-[#B58D2F]" />}
          </div>
          <Collapse isOpened={isOpenCatFilter}>
            <div className="flex flex-col mt-4 max-h-56 overflow-y-auto no-scrollbar py-1">
              {categoryList.map((cat) => (
                <FormControlLabel
                  key={cat._id}
                  control={
                    <Checkbox
                      size="small"
                      sx={{ 
                        color: '#EDE3D2', 
                        '&.Mui-checked': { color: '#B58D2F' } 
                      }}
                      checked={selectedCategories.includes(cat._id)}
                      onChange={() => handleCategoryChange(cat._id)}
                    />
                  }
                  label={<span className="text-sm font-medium text-[#544231] tracking-wide">{cat.categoryname}</span>}
                />
              ))}
            </div>
          </Collapse>
        </div>

        {/* Price section */}
        <div className="pb-2">
          <div 
            className="flex justify-between items-center cursor-pointer group" 
            onClick={() => setIsOpenPriceFilter(!isOpenPriceFilter)}
          >
            <h3 className="font-serif text-lg font-bold text-[#322619] group-hover:text-[#B58D2F] transition-colors">Price</h3>
            {isOpenPriceFilter ? <FaAngleUp className="text-[#B58D2F]" /> : <FaAngleDown className="text-[#B58D2F]" />}
          </div>
          <Collapse isOpened={isOpenPriceFilter}>
            <div className="px-3 mt-6">
              <Slider
                value={priceRange}
                onChange={(e, val) => setPriceRange(val)}
                min={0}
                max={10000}
                valueLabelDisplay="auto"
                sx={{ 
                  color: '#B58D2F',
                  '& .MuiSlider-thumb': { backgroundColor: '#322619', border: '2px solid #B58D2F' },
                  '& .MuiSlider-track': { height: 4 },
                  '& .MuiSlider-rail': { color: '#EDE3D2', height: 4 }
                }}
              />
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-[#544231]/40 mt-2">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>
          </Collapse>
        </div>

        {/* Discount section */}
        <div className="pb-2 border-b border-dashed border-[#EDE3D2]">
          <div 
            className="flex justify-between items-center cursor-pointer group" 
            onClick={() => setIsOpenDiscountFilter(!isOpenDiscountFilter)}
          >
            <h3 className="font-serif text-lg font-bold text-[#322619] group-hover:text-[#B58D2F] transition-colors">Discounts</h3>
            {isOpenDiscountFilter ? <FaAngleUp className="text-[#B58D2F]" /> : <FaAngleDown className="text-[#B58D2F]" />}
          </div>
          <Collapse isOpened={isOpenDiscountFilter}>
            <div className="flex flex-col mt-4 py-1">
              {[10, 20, 30, 40, 50].map((d) => (
                <FormControlLabel
                  key={d}
                  control={
                    <Checkbox
                      size="small"
                      sx={{ 
                        color: '#EDE3D2', 
                        '&.Mui-checked': { color: '#B58D2F' } 
                      }}
                      checked={selectedDiscount === d}
                      onChange={() => handleDiscountChange(d)}
                    />
                  }
                  label={<span className="text-sm font-medium text-[#544231] tracking-wide">{d}% or more</span>}
                />
              ))}
            </div>
          </Collapse>
        </div>

        {/* Apply Button - Matches Checkout Styling */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleApply}
          sx={{ 
            backgroundColor: '#322619', 
            borderRadius: '50px', 
            py: 1.8, 
            fontWeight: 'bold', 
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            fontSize: '0.75rem',
            boxShadow: '0 10px 20px -5px rgba(50, 38, 25, 0.3)',
            '&:hover': { backgroundColor: '#B58D2F' },
            transition: 'all 0.4s'
          }}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

export default LeftFilter;