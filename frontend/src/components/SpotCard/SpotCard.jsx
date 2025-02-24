import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import "./SpotCard.css";

function SpotCard({ spot }) {
  return (
    <div className="spot-card">
      <img
        src={spot.previewImage}
        alt={spot.name}
        className="spot-card-image"
      />
      <div className="spot-card-contnet">
        <div className="spot-card-rating">
          <h3>{spot.name}</h3>
          <FontAwesomeIcon icon={faStar} /> {spot.avgRating}
        </div>
        <div className="spot-card-price">${spot.price} / night</div>
      </div>
    </div>
  );
}

export default SpotCard;
