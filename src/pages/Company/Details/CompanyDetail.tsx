import { useParams } from "react-router-dom";
// import HkCompdetail from "./HkCompdetail";
import UsCompdetail from "./UsCompdetail";
import OldCCCDetail from "./OldCCCDetail";
import SgCompdetail from "./SgCompDetail";
import PaCompdetail from "./PaCompDetail";
import HKCompDetailSummary from "./NewCompDetail";

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
            default:
                return <p> Not Found... </p>
        }
    };

    return renderComponent();
};

export default CompanyDetail;
