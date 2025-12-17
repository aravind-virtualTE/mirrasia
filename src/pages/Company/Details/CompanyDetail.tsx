import { useParams } from "react-router-dom";
// import HkCompdetail from "./HkCompdetail";
import UsCompdetail from "./UsCompdetail";
import OldCCCDetail from "./OldCCCDetail";
import SgCompdetail from "./SgCompDetail";
import PaCompdetail from "./PaCompDetail";
import HKCompDetailSummary from "./NewCompDetail";
import PPifCompDetail from "./PPifCompDetail";

const CompanyDetail = () => {
    const { countryCode, id } = useParams();
    console.log("countryCode-->", countryCode, "id-->", id);
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
                return <p>In progress...</p>
            case "SC": // Seychelles
                return <p>In progress...</p>
            case "CH": // Switzerland
                return <p>In progress...</p>
            case "MT": // Malta
                return <p>In progress...</p>
            case "MH": // Marshall Islands
                return <p>In progress...</p>
            case "KY": // Cayman Islands
                return <p>In progress...</p>
            case "BVI": // British Virgin Islands
                return <p>In progress...</p>
            case "BZ": // Belize
                return <p>In progress...</p>
            case "CW": // Curacao
                return <p>In progress...</p>
            case "EE": // Estonia
                return <p>In progress...</p>
            case "VC": // Saint Vincent and the Grenadines
                return <p>In progress...</p>
            
            default:
                return <p> Not Found... </p>
        }
    };

    return renderComponent();
};

export default CompanyDetail;
