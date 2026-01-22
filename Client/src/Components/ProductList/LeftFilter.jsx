import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Collapse } from 'react-collapse';
import { Checkbox, FormControlLabel, Slider, Button } from '@mui/material';
import { FaAngleUp, FaAngleDown } from 'react-icons/fa';

function LeftFilter({ onApplyFilters, initialCatId }) {
  const [isOpenCatFilter, setIsOpenCatFilter] = useState(true);
  const [isOpenPriceFilter, setIsOpenPriceFilter] = useState(true);
  const [isOpenDiscountFilter, setIsOpenDiscountFilter] = useState(true);
  
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);

  // Sync with the URL category when it loads
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
    // If clicking the same discount, it deselects (null), otherwise sets the new value
    setSelectedDiscount(prev => (prev === val ? null : val));
  };

  return (
    <div className="p-5 space-y-6">
      <div className="block lg:hidden">
        <button
          className="bg-[#7d0492] text-white px-4 py-2 rounded-lg w-full font-bold"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Close Filters" : "Filter Products"}
        </button>
      </div>

      <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-8`}>
        {/* Category section */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpenCatFilter(!isOpenCatFilter)}>
            <h3 className="font-bold text-slate-800">Categories</h3>
            {isOpenCatFilter ? <FaAngleUp /> : <FaAngleDown />}
          </div>
          <Collapse isOpened={isOpenCatFilter}>
            <div className="flex flex-col mt-3 max-h-48 overflow-y-auto">
              {categoryList.map((cat) => (
                <FormControlLabel
                  key={cat._id}
                  control={
                    <Checkbox
                      size="small"
                      sx={{ color: '#7d0492', '&.Mui-checked': { color: '#7d0492' } }}
                      checked={selectedCategories.includes(cat._id)}
                      onChange={() => handleCategoryChange(cat._id)}
                    />
                  }
                  label={<span className="text-sm font-medium text-slate-600">{cat.categoryname}</span>}
                />
              ))}
            </div>
          </Collapse>
        </div>

        {/* Price section */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpenPriceFilter(!isOpenPriceFilter)}>
            <h3 className="font-bold text-slate-800">Price Range</h3>
            {isOpenPriceFilter ? <FaAngleUp /> : <FaAngleDown />}
          </div>
          <Collapse isOpened={isOpenPriceFilter}>
            <div className="px-2 mt-4">
              <Slider
                value={priceRange}
                onChange={(e, val) => setPriceRange(val)}
                min={0}
                max={10000}
                valueLabelDisplay="auto"
                sx={{ color: '#7d0492' }}
              />
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>
          </Collapse>
        </div>

        {/* Discount section - THE FIX IS HERE */}
        <div className="pb-2">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpenDiscountFilter(!isOpenDiscountFilter)}>
            <h3 className="font-bold text-slate-800">Discount</h3>
            {isOpenDiscountFilter ? <FaAngleUp /> : <FaAngleDown />}
          </div>
          <Collapse isOpened={isOpenDiscountFilter}>
            <div className="flex flex-col mt-3">
              {[10, 20, 30, 40, 50].map((d) => (
                <FormControlLabel
                  key={d}
                  control={
                    <Checkbox
                      size="small"
                      sx={{ color: '#7d0492', '&.Mui-checked': { color: '#7d0492' } }}
                      checked={selectedDiscount === d}
                      onChange={() => handleDiscountChange(d)}
                    />
                  }
                  label={<span className="text-sm font-medium text-slate-600">{d}% or more</span>}
                />
              ))}
            </div>
          </Collapse>
        </div>

        <Button
          variant="contained"
          fullWidth
          onClick={handleApply}
          sx={{ backgroundColor: '#7d0492', borderRadius: '12px', py: 1.5, fontWeight: 'bold', '&:hover': { backgroundColor: '#5a036a' } }}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

export default LeftFilter;