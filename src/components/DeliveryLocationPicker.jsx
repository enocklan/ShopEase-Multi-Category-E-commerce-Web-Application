
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet'

import L from 'leaflet'

import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

import 'leaflet/dist/leaflet.css'

// ShopEase shop location: HH Towers, Nairobi CBD
const shopLocation = [-1.28339, 36.82319]

// Configure the default Leaflet marker for Vite
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function LocationMarker({ selectedLocation, onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      })
    },
  })

  if (!selectedLocation) return null

  return (
    <Marker
      position={[
        selectedLocation.lat,
        selectedLocation.lng,
      ]}
      icon={defaultIcon}
      draggable={true}
      eventHandlers={{
        dragend(event) {
          const position = event.target.getLatLng()

          onLocationSelect({
            lat: position.lat,
            lng: position.lng,
          })
        },
      }}
    >
      <Popup>Your delivery location</Popup>
    </Marker>
  )
}

function DeliveryLocationPicker({
  selectedLocation,
  onLocationSelect,
}) {
  return (
    <div className="w-full">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Select your delivery location
        </h3>

        <p className="text-sm text-gray-600">
          Click on the map to place your delivery pin.
          You can drag the pin to adjust it.
        </p>
      </div>

      <div className="h-95 w-full overflow-hidden rounded-xl border border-gray-200">
        <MapContainer
          center={shopLocation}
          zoom={14}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LocationMarker
            selectedLocation={selectedLocation}
            onLocationSelect={onLocationSelect}
          />
        </MapContainer>
      </div>

      {selectedLocation && (
        <p className="mt-3 text-sm text-green-700">
          Delivery location selected:
          {' '}
          {selectedLocation.lat.toFixed(6)},
          {' '}
          {selectedLocation.lng.toFixed(6)}
        </p>
      )}
    </div>
  )
}

export default DeliveryLocationPicker
