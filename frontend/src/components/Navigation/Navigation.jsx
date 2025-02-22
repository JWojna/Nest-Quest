import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <div id='navbar'>
      <>
        <NavLink to="/">
        <img src="../../images/nestQuestBrandIcon.jpg" alt="Brand" className='brand-icon' />
        Nest Quest
        </NavLink>
      </>
      {isLoaded && (
        <>
          <ProfileButton user={sessionUser} />
        </>
      )}
    </div>
  );
}

export default Navigation;
