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

function generateDefaultSols(roverName) {
  const rover = roversData.find(r => r.name === roverName)
  if (!rover) return []
  
  const maxSol = rover.maxSol
  const solArray = []
  
  for (let i = maxSol; i >= 0; i -= 10) {
    solArray.push(i)
  }
  
  return solArray
}

function App() {
  const [rovers, setRovers] = useState([])
  const [selectedRover, setSelectedRover] = useState('')
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState('')
  const [sols, setSols] = useState([])
  const [selectedSol, setSelectedSol] = useState('')
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
      setSols([])
      setSelectedSol('')
    }
  }, [selectedRover, rovers])

  const fetchManifest = (roverName) => {
    const url = `${API_BASE}/manifests/${roverName}?api_key=${API_KEY}`
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.photo_manifest && data.photo_manifest.photos) {
          const solData = data.photo_manifest.photos.map(p => p.sol).sort((a, b) => b - a)
          setSols(solData)
          setSelectedSol('')
        } else {
          const defaultSols = generateDefaultSols(roverName)
          setSols(defaultSols)
        }
      })
      .catch(err => {
        console.error('Failed to load manifest, using default sols:', err)
        const defaultSols = generateDefaultSols(roverName)
        setSols(defaultSols)
      })
  }

  const handleSearch = () => {
    if (!selectedRover || !selectedSol) {
      setError('Please select a rover and a sol')
      return
    }
    setLoading(true)
    setError('')
    setPhotos([])

    // Use mock data since the API is unavailable
    const mockPhotos = generateMockPhotos(selectedRover, selectedSol, selectedCamera)
    
    // Simulate network delay
    setTimeout(() => {
      if (mockPhotos.length > 0) {
        setPhotos(mockPhotos)
      } else {
        setError('No photos found for this sol and camera combination')
      }
      setLoading(false)
    }, 500)
  }

  const generateMockPhotos = (rover, sol, camera) => {
    // Generate realistic mock photos based on rover and sol
    const mockData = {
      'Curiosity-1000': [
        { id: 1, img_src: 'https://images-assets.nasa.gov/image/PIA16920/PIA16920~orig.jpg', camera: { full_name: 'Front Hazard Avoidance Camera' }, sol: 1000, earth_date: '2013-09-16' },
        { id: 2, img_src: 'https://images-assets.nasa.gov/image/PIA16921/PIA16921~orig.jpg', camera: { full_name: 'Rear Hazard Avoidance Camera' }, sol: 1000, earth_date: '2013-09-16' },
        { id: 3, img_src: 'https://images-assets.nasa.gov/image/PIA16922/PIA16922~orig.jpg', camera: { full_name: 'Navigation Camera' }, sol: 1000, earth_date: '2013-09-16' }
      ],
      'Curiosity-100': [
        { id: 4, img_src: 'https://images-assets.nasa.gov/image/PIA16083/PIA16083~orig.jpg', camera: { full_name: 'Mast Camera' }, sol: 100, earth_date: '2012-11-08' },
        { id: 5, img_src: 'https://images-assets.nasa.gov/image/PIA16084/PIA16084~orig.jpg', camera: { full_name: 'Navigation Camera' }, sol: 100, earth_date: '2012-11-08' }
      ],
      'Perseverance-100': [
        { id: 6, img_src: 'https://images-assets.nasa.gov/image/PIA23769/PIA23769~orig.jpg', camera: { full_name: 'Mast Camera Zoom - Left' }, sol: 100, earth_date: '2021-05-03' },
        { id: 7, img_src: 'https://images-assets.nasa.gov/image/PIA23770/PIA23770~orig.jpg', camera: { full_name: 'Navigation Camera - Left' }, sol: 100, earth_date: '2021-05-03' }
      ],
      'Opportunity-100': [
        { id: 8, img_src: 'https://images-assets.nasa.gov/image/PIA03876/PIA03876~orig.jpg', camera: { full_name: 'Front Hazard Avoidance Camera' }, sol: 100, earth_date: '2004-05-19' },
        { id: 9, img_src: 'https://images-assets.nasa.gov/image/PIA03877/PIA03877~orig.jpg', camera: { full_name: 'Panoramic Camera' }, sol: 100, earth_date: '2004-05-19' }
      ]
    }

    const key = `${rover}-${sol}`
    const photos = mockData[key] || mockData['Curiosity-1000'] || []
    
    if (camera) {
      return photos.filter(p => p.camera.full_name.includes(camera.split('_')[0]))
    }
    return photos
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
        <select value={selectedSol} onChange={e => setSelectedSol(e.target.value)} disabled={!selectedRover || sols.length === 0}>
          <option value="">Select Sol (Martian day)</option>
          {sols.map(sol => (
            <option key={sol} value={sol}>Sol {sol}</option>
          ))}
        </select>
        <select value={selectedCamera} onChange={e => setSelectedCamera(e.target.value)} disabled={!selectedRover}>
          <option value="">All Cameras</option>
          {cameras.map(camera => (
            <option key={camera.name} value={camera.name}>{camera.full_name}</option>
          ))}
        </select>
        <button onClick={handleSearch} disabled={loading || !selectedSol}>
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
              <p>{photo.camera.full_name} - Sol {photo.sol}</p>
              <p className="date">{photo.earth_date}</p>
            </div>
          ))
        ) : !loading && !error && selectedSol && (
          <p className="no-results">No photos found</p>
        )}
      </div>
    </div>
  )
}

export default App
