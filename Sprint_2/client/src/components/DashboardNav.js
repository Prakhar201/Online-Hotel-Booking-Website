import { Link } from "react-router-dom";


const DashboardNav = () => {
    //Gives current location(url path)
    const active = window.location.pathname;

    return (
        <ul className="nav nav-tabs">
            <li className ="nav-item">
                <Link 
                //To show which link is active
                className={`nav-link ${active ==="/dashboard" && "active"}`} 
                to="/dashboard"
                >
                    Your Bookings
                </Link>
            </li>
            <li className ="nav-item">
                <Link 
                className={`nav-link ${active ==="/dashboard/seller" && "active"}`}  
                to="/dashboard/seller"
                >
                    Your Hotels
                </Link>
            </li>
        </ul>
    );
};

export default DashboardNav;