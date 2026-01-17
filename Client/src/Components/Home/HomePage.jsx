import React from 'react'
import Banner from '../Home/HomePageSlider/Banner.jsx'
import NavCatSlider from '../Home/NavcatSlider/NavcatSlider.jsx'
import FreeShip from '../Home/Advertise/FreeShip.jsx'
import Adevert from '../Home/Advertise/Adevert.jsx'
import ProductSlider from '../Home/ProductSlider/Productslider.jsx'
import MiddelAds from '../Home/Advertise/MiddelAds.jsx'
import RelationSlider from './RelationshipSlider/RelationSlider.jsx'

function Home() {
  return (
    <>
     <Banner/> 
    
     <NavCatSlider />
     <FreeShip/>
     <Adevert/>
     <MiddelAds/>
     <ProductSlider  title='Birthday Gifts That Wow' />
     <RelationSlider/>
    </>
  )
}

export default Home
