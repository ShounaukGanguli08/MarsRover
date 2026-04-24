import { useState, useEffect } from 'react'
import './App.css'

const NASA_IMAGE_API = 'https://images-api.nasa.gov/search'

const roversData = [
  {
    name: 'Curiosity',
    maxSol: 3700,
    cameras: [
      { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
      { name: 'RHAZ', full_name: 'Rear Hazard Avoidance Camera' },
      { name: 'MAST', full_name: 'Mast Camera' },
      { name: 'CHEMCAM', full_name: 'Chemistry and Camera Complex' },
      { name: 'MAHLI', full_name: 'Mars Hand Lens Imager' },
      { name: 'MARDI', full_name: 'Mars Descent Imager' },
      { name: 'NAVCAM', full_name: 'Navigation Camera' },
      { name: 'PANCAM', full_name: 'Panoramic Camera' },
      { name: 'MINITES', full_name: 'Miniature Thermal Emission Spectrometer' }
    ]
  },
  {
    name: 'Opportunity',
    maxSol: 5111,
    cameras: [
      { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
      { name: 'RHAZ', full_name: 'Rear Hazard Avoidance Camera' },
      { name: 'NAVCAM', full_name: 'Navigation Camera' },
      { name: 'PANCAM', full_name: 'Panoramic Camera' },
      { name: 'MINITES', full_name: 'Miniature Thermal Emission Spectrometer' }
    ]
  },
  {
    name: 'Spirit',
    maxSol: 2208,
    cameras: [
      { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
      { name: 'RHAZ', full_name: 'Rear Hazard Avoidance Camera' },
      { name: 'NAVCAM', full_name: 'Navigation Camera' },
      { name: 'PANCAM', full_name: 'Panoramic Camera' },
      { name: 'MINITES', full_name: 'Miniature Thermal Emission Spectrometer' }
    ]
  },
  {
    name: 'Perseverance',
    maxSol: 1200,
    cameras: [
      { name: 'EDL_RUCAM', full_name: 'Rover Up-Look Camera' },
      { name: 'EDL_RDCAM', full_name: 'Rover Down-Look Camera' },
      { name: 'EDL_DDCAM', full_name: 'Descent Stage Down-Look Camera' },
      { name: 'EDL_PUCAM1', full_name: 'Parachute Up-Look Camera A' },
      { name: 'EDL_PUCAM2', full_name: 'Parachute Up-Look Camera B' },
      { name: 'NAVCAM_LEFT', full_name: 'Navigation Camera - Left' },
      { name: 'NAVCAM_RIGHT', full_name: 'Navigation Camera - Right' },
      { name: 'MCZ_RIGHT', full_name: 'Mast Camera Zoom - Right' },
      { name: 'MCZ_LEFT', full_name: 'Mast Camera Zoom - Left' },
      { name: 'FRONT_HAZCAM_LEFT_A', full_name: 'Front Hazard Avoidance Camera - Left' },
      { name: 'FRONT_HAZCAM_RIGHT_A', full_name: 'Front Hazard Avoidance Camera - Right' },
      { name: 'REAR_HAZCAM_LEFT', full_name: 'Rear Hazard Avoidance Camera - Left' },
      { name: 'REAR_HAZCAM_RIGHT', full_name: 'Rear Hazard Avoidance Camera - Right' },
      { name: 'SKYCAM', full_name: 'MEDA Skycam' },
      { name: 'SHERLOC_WATSON', full_name: 'SHERLOC WATSON Camera' }
    ]
  }
]

function generateDefaultDates() {
  const dates = []
  const today = new Date()
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }
  
  return ['all', ...dates]
}

async function fetchAvailableDates(roverName) {
  try {
    const query = encodeURIComponent(`${roverName} Mars Rover`)
    const url = `${NASA_IMAGE_API}?q=${query}&media_type=image&page_size=100`
    const response = await fetch(url)
    const data = await response.json()
    const items = data.collection?.items || []
    
    const dateSet = new Set()
    items.forEach(item => {
      const date = item.data?.[0]?.date_created
      if (date) {
        const dateOnly = date.split('T')[0]
        dateSet.add(dateOnly)
      }
    })
    
    const dateArray = Array.from(dateSet).sort().reverse() // descending (newest first)
    return dateArray.length > 0 ? ['all', ...dateArray] : ['all', ...generateDefaultDates()]
  } catch (error) {
    console.error('Error fetching available dates:', error)
    return ['all', ...generateDefaultDates()] // fallback
  }
}

function App() {
  const [rovers, setRovers] = useState([])
  const [selectedRover, setSelectedRover] = useState('')
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState('')
  const [dates, setDates] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setRovers(roversData)
  }, [])

  useEffect(() => {
    if (selectedRover) {
      const rover = rovers.find(r => r.name === selectedRover)
      if (rover) {
        setCameras(rover.cameras)
        setSelectedCamera('')
      }
      fetchManifest(selectedRover)
    } else {
      setCameras([])
      setSelectedCamera('')
      setDates([])
      setSelectedDate('')
    }
  }, [selectedRover, rovers])

  const fetchManifest = async (roverName) => {
    const dates = await fetchAvailableDates(roverName)
    setDates(dates)
  }

  const handleSearch = () => {
    if (!selectedRover || !selectedDate) {
      setError('Please select a rover and a date')
      return
    }
    setLoading(true)
    setError('')
    setPhotos([])

    const queryParts = [selectedRover, 'Mars Rover']
    if (selectedCamera) {
      queryParts.push(selectedCamera.replace(/_/g, ' '))
    }
    // Always search for the rover without date filter, then filter client-side
    // This ensures consistency between "All Dates" and individual date selections
    const query = encodeURIComponent(queryParts.join(' '))
    const url = `${NASA_IMAGE_API}?q=${query}&media_type=image&page_size=100`

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const items = data.collection?.items || []
        const filtered = items
          .map(item => {
            const link = item.links?.find(link => link.render === 'image')
            const datum = item.data?.[0]
            if (!link || !datum) return null
            return {
              id: datum.nasa_id,
              img_src: link.href,
              camera: { full_name: datum.instrument || datum.secondary_creator || datum.title || selectedCamera || 'Mars Rover Camera' },
              earth_date: datum.date_created ? datum.date_created.split('T')[0] : 'Unknown'
            }
          })
          .filter(Boolean)
          // Filter by date client-side if a specific date is selected
          .filter(photo => selectedDate === 'all' || photo.earth_date === selectedDate)

        if (filtered.length === 0) {
          setError(`No images found in NASA Image Library for this rover${selectedDate === 'all' ? '' : ` on ${selectedDate}`}`)
        } else {
          setPhotos(filtered)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching NASA image library:', err)
        setError('Failed to load NASA Image Library')
        setLoading(false)
      })
  }


  return (
    <div className="app">
      <h1>Mars Rover Photos</h1>
      <div className="form">
        <select value={selectedRover} onChange={e => setSelectedRover(e.target.value)}>
          <option value="">Select Rover</option>
          {rovers.map(rover => (
            <option key={rover.name} value={rover.name}>{rover.name}</option>
          ))}
        </select>
        <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} disabled={!selectedRover || dates.length === 0}>
          <option value="">Select Date</option>
          {dates.map(date => (
            <option key={date} value={date}>{date === 'all' ? 'All Dates' : date}</option>
          ))}
        </select>
        <select value={selectedCamera} onChange={e => setSelectedCamera(e.target.value)} disabled={!selectedRover}>
          <option value="">All Cameras</option>
          {cameras.map(camera => (
            <option key={camera.name} value={camera.name}>{camera.full_name}</option>
          ))}
        </select>
        <button onClick={handleSearch} disabled={loading || !selectedDate}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Loading photos...</p>}
      <div className="photos">
        {photos.length > 0 ? (
          photos.map(photo => (
            <div key={photo.id} className="photo">
              <img src={photo.img_src} alt={photo.camera.full_name} />
              <p>{photo.camera.full_name}</p>
              <p className="date">{photo.earth_date}</p>
            </div>
          ))
        ) : !loading && !error && selectedDate && (
          <p className="no-results">No photos found</p>
        )}
      </div>
    </div>
  )
}

export default App
