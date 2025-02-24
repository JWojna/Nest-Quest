const SET_SPOTS = 'spots/SET_SPOTS';
const ADD_SPOTS = 'spots/ADD_SPOT';
const REMOVE_SPOT = 'spots/REMOVE_SPOT';
const SET_SPOT_DETAILS = 'spots/SET_SPOT_DETAILS';

// Action creators
const setSpots = (spots) => ({
    type: SET_SPOTS,
    payload: spots
});

const setSpot = (spot) => ({
    type: SET_SPOT_DETAILS,
    payload: spot
});

// const addSpot = (spot) => ({
//     type: ADD_SPOTS,
//     payload: spot
// });

// const removeSpot = (spotId) => ({
//     type: REMOVE_SPOT,
//     payload: spotId
// });

// thunk actions
export const fetchSpots = () => async (dispatch) => {
    const response = await fetch('/api/spots');
    if (!response.ok) throw new Error('failed to fetch spots');

    const data = await response.json()
    dispatch(setSpots(data.Spots));
    return response;
};

export const fetchSpotDetails = (spotId) => async (dispatch) => {
    const response = await fetch(`/api/spots/${spotId}`);
    if (!response.ok) throw new Error('failed to fetch spot');

    const data = await response.json()
    dispatch(setSpot(data.Spot));
    return response;
}

// reducer
const initialState = {
    spots: [],
    spot: []
};

const spotsReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_SPOTS:
            return { ...state, spots: action.payload };
        case SET_SPOT_DETAILS:
            return{ ...state, spot: { ...state.spot, [action.payload.id]: action.payload }}
        case ADD_SPOTS:
            return { ...state, spots: [...state.spots, action.payload] };
        case REMOVE_SPOT:
            return { ...state, spots: state.spots.filter(spot => spot.id !== action.payload) };
        default:
            return state;
    }
};

export default spotsReducer;
