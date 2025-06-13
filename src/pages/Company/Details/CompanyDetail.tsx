import { useParams } from "react-router-dom";
import HkCompdetail from "./HkCompdetail";
import UsCompdetail from "./UsCompdetail";
import OldCCCDetail from "./OldCCCDetail";

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
                return <HkCompdetail id={id ?? ""} />;
            case "ccc":
                return <OldCCCDetail id={id ?? ""} />;
            default:
                return <p> Not Found... </p>
        }
    };

    return renderComponent();
};

export default CompanyDetail;
