import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { fetchSpots } from "../../store/spots";
import SpotCard from "../SpotCard";
import './LandingPage.css';


function LandingPage() {
    const dispatch = useDispatch();
    const spots = useSelector(state => state.spots.spots); // Adjust according to your state shape
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      dispatch(fetchSpots()).then(() => setLoaded(true));
    }, [dispatch]);

    return (
      <div className="landing-page">
        <div className="spots-container">
          {loaded && spots.map(spot => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      </div>
    );
  }

  export default LandingPage;
