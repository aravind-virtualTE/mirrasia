import React, { useEffect, useState } from 'react'
import HkShareHldrDir from './HkShareHldrDir'
import UsShdr from './us/UsShdr'
import UsCorporateShdr from './us/UsCorporateShdr'

const CountryWiseShareholder:React.FC = () => {
    const [country, setCountry] = useState("HK")

    useEffect(() =>{
      const country = localStorage.getItem('country')
      setCountry(country ?? "HK")
    }, [])
    
    if(country == 'HK') return <HkShareHldrDir />
    if(country == 'US_Individual') return <UsShdr />
    if(country == 'US_Corporate') return <UsCorporateShdr />

    return (
      <div>
        country specific form not found. 
      </div>
    )
  
}

export default CountryWiseShareholder