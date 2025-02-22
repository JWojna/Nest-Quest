const SET_SPOTS = 'spots/SET_SPOTS';
const ADD_SPOTS = 'spots/ADD_SPOT';
const REMOVE_SPOT = 'spots/REMOVE_SPOT';

// Action creators
const setSpots = (spots) => ({
    type: SET_SPOTS,
    payload: spots
});

const addSpot = (spot) => ({
    type: ADD_SPOTS,
    payload: spot
});

const removeSpot = (spotId) => ({
    type: REMOVE_SPOT,
    payload: spotId
});

// thunk actions to fetch spots
export const fetchSpots = () => async (dispatch) => {
    const response = await fetch('/api/spots');
    if (!response.ok) throw new Error('failed to fetch spots');

    const data = await response.json()
    // console.log(data);
    dispatch(setSpots(data.Spots));
    return response;
};

// reducer
const initialState = {
    spots: []
};

const spotsReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_SPOTS:
            return { ...state, spots: action.payload };
        case ADD_SPOTS:
            return { ...state, spots: [...state.spots, action.payload] };
        case REMOVE_SPOT:
            return { ...state, spots: state.spots.filter(spot => spot.id !== action.payload) };
        default:
            return state;
    }
};

export default spotsReducer;
