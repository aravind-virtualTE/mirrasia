import { useParams } from "react-router-dom";
// import HkCompdetail from "./HkCompdetail";
import UsCompdetail from "./UsCompdetail";
import OldCCCDetail from "./OldCCCDetail";
import SgCompdetail from "./SgCompDetail";
import PaCompdetail from "./PaCompDetail";
import HKCompDetailSummary from "./NewCompDetail";
import PPifCompDetail from "./PPifCompDetail";
import UKDetail from "./UKDetail";
import SeychellesDetail from "./SeychellesDetail";
import SwitzerlandDetail from "./SwitzerlandDetail";
import MaltaDetail from "./MaltaDetail";
import MarshallDetail from "./MarshallDetail";
import CaymanDetail from "./CaymanDetail";
import BviDetail from "./BviDetail";
import BelizeDetail from "./BelizeDetail";
import CuracaoDetail from "./CuracaoDetail";
import EstoniaDetail from "./EstoniaDetail";
import SaintVincentDetail from "./SaintVincentDetail";
import UaeDetail from "./UaeDetail";

const CompanyDetail = () => {
    const { countryCode, id } = useParams();
    // console.log("countryCode-->", countryCode, "id-->", id);
    // return (
    //     <HkCompdetail id={id ?? ""} />
    // );
    const renderComponent = () => {
        switch (countryCode) {
            case "US":
                return <UsCompdetail id={id ?? ""} />;
            case "HK":
                // return <HkCompdetail id={id ?? ""} />;
                return <HKCompDetailSummary id={id ?? ""} />;
            case "ccc":
                return <OldCCCDetail id={id ?? ""} />;
            case "SG":
                return <SgCompdetail id={id ?? ""} />;
            case "PA":
                return <PaCompdetail id={id ?? ""} />;
            case "PPIF":
                return <PPifCompDetail id={id ?? ""} />;
            case "GB": // United Kingdom
                return <UKDetail id={id ?? ""} />;
            case "SC": // Seychelles    
                return <SeychellesDetail id={id ?? ""} />;
            case "CH": // Switzerland
                return <SwitzerlandDetail id={id ?? ""} />;
            case "MT": // Malta
                return <MaltaDetail id={id ?? ""} />;
            case "MH": // Marshall Islands
                return <MarshallDetail id={id ?? ""} />;
            case "KY": // Cayman Islands
                return <CaymanDetail id={id ?? ""} />;
            case "BVI": // British Virgin Islands
                return <BviDetail id={id ?? ""} />;
            case "BZ": // Belize
                return <BelizeDetail id={id ?? ""} />;
            case "CW": // Curacao
                return <CuracaoDetail id={id ?? ""} />;
            case "EE": // Estonia
                return <EstoniaDetail id={id ?? ""} />;
            case "VC": // Saint Vincent and the Grenadines
                return <SaintVincentDetail id={id ?? ""} />;
            case "AE": // Saint Vincent and the Grenadines
                return <UaeDetail id={id ?? ""} />;
            
            default:
                return <p> Not Found... </p>
        }
    };

    return renderComponent();
};

export default CompanyDetail;
