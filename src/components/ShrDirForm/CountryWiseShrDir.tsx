/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import HkShareHldrDir from './HkShareHldrDir'
import { multiShrDirResetAtom } from '../shareholderDirector/constants'
import { useAtom } from 'jotai'
import UsShdr from './us/UsShdr'

const CountryWiseShareholder:React.FC = () => {
    const [multiData,] = useAtom<any>(multiShrDirResetAtom)
    const [country, setCountry] = useState("HK")

    useEffect(() =>{
      const multiShId = localStorage.getItem("shdrItem")
    const findData =  multiData.length >0
    ? multiData.find((item: { _id: string | null; }) => item._id === multiShId)
    : null;
    console.log("findData",findData)
    setCountry(findData.country)
    }, [])
    
    if(country == 'HK') return <HkShareHldrDir />
    if(country == 'US') return <UsShdr />

    return (
      <div>
        country specific form not found. 
      </div>
    )
  
}

export default CountryWiseShareholder