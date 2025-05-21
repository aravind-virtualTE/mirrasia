/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import HkShareHldrDir from './HkShareHldrDir'
import { multiShrDirResetAtom } from '../shareholderDirector/constants'
import { useAtom } from 'jotai'

const CountryWiseShareholder:React.FC = () => {
    const [multiData,] = useAtom<any>(multiShrDirResetAtom)
    const [country, setCountry] = useState("HK")

    useEffect(() =>{
      const multiShId = localStorage.getItem("shdrItem")
    const findData =  multiData.length >0
    ? multiData.find((item: { _id: string | null; }) => item._id === multiShId)
    : null;
    setCountry(findData.country)
    // console.log("findData",findData)
    }, [])
    
    if(country == 'HK') return <HkShareHldrDir />

    return (
      <div>
        country specific form not found. 
      </div>
    )
  
}

export default CountryWiseShareholder