import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './DogSearch.css'; // Add CSS for grid and card styling

function DogSearch() {
  const [dogs, setDogs] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [selectedBreeds, setSelectedBreeds] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(0);

  useEffect(() => {
    // Fetch all available breeds
    axios
      .get('https://frontend-take-home-service.fetch.com/dogs/breeds', {
        withCredentials: true,
      })
      .then((response) => {
        setBreeds(response.data);
      });

    fetchDogs();
  }, [selectedBreeds, sortOrder, page]);

  const fetchDogs = async () => {
    const { data } = await axios.get(
      'https://frontend-take-home-service.fetch.com/dogs/search',
      {
        params: {
          breeds: selectedBreeds,
          sort: `breed:${sortOrder}`,
          size: 25,
          from: page * 25,
        },
        withCredentials: true,
      }
    );
    setDogs(data.resultIds);
  };

  const toggleFavorite = (dogId) => {
    setFavorites((prev) => {
      if (prev.includes(dogId)) {
        return prev.filter((id) => id !== dogId);
      } else {
        return [...prev, dogId];
      }
    });
  };

  const handleMatch = async () => {
    const { data } = await axios.post(
      'https://frontend-take-home-service.fetch.com/dogs/match',
      favorites,
      { withCredentials: true }
    );
    alert(`Your matched dog: ${data.match}`);
  };

  const handleBreedSelection = (breed) => {
    if (selectedBreeds.includes(breed)) {
      setSelectedBreeds(selectedBreeds.filter((b) => b !== breed));
    } else {
      setSelectedBreeds([...selectedBreeds, breed]);
    }
  };

  return (
    <div className="search-container">
      <div className="filters">
        <div>
          <label>Breed: &nbsp;</label>
          <MultiSelectDropdown
            options={breeds}
            selectedOptions={selectedBreeds}
            onSelectionChange={handleBreedSelection}
          />
        </div>

        <div>
          <label>Sort Order: &nbsp;</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className='sortorder'
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <div className="dog-grid">
        {dogs.map((dogId) => (
          <DogCard
            key={dogId}
            dogId={dogId}
            onFavorite={toggleFavorite}
            isFavorite={favorites.includes(dogId)}
          />
        ))}
      </div>
      <div className="pagination">
        <button onClick={() => setPage((prev) => Math.max(0, prev - 1))}>
          Previous
        </button>
        <button onClick={() => setPage((prev) => prev + 1)}>Next</button>
        <button className="favorite-button" onClick={handleMatch}>
          Find Your Match
        </button>
      </div>
    </div>
  );
}

function DogCard({ dogId, onFavorite, isFavorite }) {
  const [dog, setDog] = useState(null);

  useEffect(() => {
    axios
      .post('https://frontend-take-home-service.fetch.com/dogs', [dogId], {
        withCredentials: true,
      })
      .then((response) => {
        setDog(response.data[0]);
      });
  }, [dogId]);

  if (!dog) return <div>Loading...</div>;

  return (
    <div className="dog-card">
      <img src={dog.img} alt={dog.name} />
      <h2>{dog.name}</h2>
      <p>{dog.breed}</p>
      <p>Age: {dog.age}</p>
      <p>Location: {dog.zip_code}</p>
      <button className="favorite-button" onClick={() => onFavorite(dogId)}>
        {isFavorite ? 'Unfavorite' : 'Favorite'}
      </button>
    </div>
  );
}

function MultiSelectDropdown({ options, selectedOptions, onSelectionChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleOutsideClick = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <div className="dropdown-header" onClick={handleToggleDropdown}>
        {selectedOptions.length > 0
          ? selectedOptions.join(', ')
          : 'Select Breeds'}
        <span className={`arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>
      {isOpen && (
        <ul className="dropdown-list">
          {options.map((option) => (
            <li key={option} onClick={() => onSelectionChange(option)}>
              <input
                type="checkbox"
                checked={selectedOptions.includes(option)}
                onChange={() => onSelectionChange(option)}
              />
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DogSearch;
