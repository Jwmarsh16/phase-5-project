import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfileById } from '../slices/userSlice';
import { useParams, Link } from 'react-router-dom';

function UserProfile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.users.profile);
  const loading = useSelector((state) => state.users.loading);
  const error = useSelector((state) => state.users.error);

  useEffect(() => {
    dispatch(fetchUserProfileById(id));
  }, [dispatch, id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="user-profile">
      <h3>{profile?.username}'s Profile</h3>
      {profile && (
        <>
          <p>Email: {profile.email}</p>
          <h3>Groups:</h3>
          <ul>
            {profile.groups.map(group => (
              <li key={group.id}>
                <Link to={`/groups/${group.id}`}>{group.name}</Link>
              </li>
            ))}
          </ul>
          <h3>Events:</h3>
          <ul>
            {profile.events.map(event => (
              <li key={event.id}>
                <Link to={`/events/${event.id}`}>{event.name}</Link> - {event.rsvp_status}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default UserProfile;
