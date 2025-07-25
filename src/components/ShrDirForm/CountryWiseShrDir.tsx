import React, { useEffect, useState } from 'react'
import HkShareHldrDir from './HkShareHldrDir'
import UsShdr from './us/UsShdr'
import UsCorporateShdr from './us/UsCorporateShdr'
import PanamaShdInvite from './pa/PanamaShareholderInvite'
import SaIndividualRegForm from './sa/SaShareholder'

const CountryWiseShareholder:React.FC = () => {
    const [country, setCountry] = useState("HK")
    console.log("CountryWiseShareholder", country)
    useEffect(() =>{
      const country = localStorage.getItem('country')
      setCountry(country ?? "HK")
    }, [])
    
    if(country == 'HK') return <HkShareHldrDir />
    if(country == 'US_Individual') return <UsShdr />
    if(country == 'US_Corporate') return <UsCorporateShdr />
    if(country == 'PA_Individual') return <PanamaShdInvite />
    if(country == 'SA_Corporate') return <p>In Progress</p>
    if(country == 'SA_Individual') return <SaIndividualRegForm />

    return (
      <div>
        country specific form not found. 
      </div>
    )
  
}

export default CountryWiseShareholder