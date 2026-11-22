
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DeliveryLocationPicker from '../DeliveryLocationPicker'

const mocks = vi.hoisted(() => ({
  mapEvents: null,
  icon: vi.fn(() => 'mock-leaflet-icon'),
}))

vi.mock('leaflet', () => ({
  default: {
    icon: mocks.icon,
  },
}))

vi.mock('react-leaflet', async () => {
  const React = await import('react')

  return {
    MapContainer: ({ children, center, zoom, scrollWheelZoom }) =>
      React.createElement(
        'div',
        {
          'data-testid': 'map-container',
          'data-center': JSON.stringify(center),
          'data-zoom': zoom,
          'data-scroll-wheel-zoom': String(scrollWheelZoom),
        },
        children
      ),

    TileLayer: ({ attribution, url }) =>
      React.createElement('div', {
        'data-testid': 'tile-layer',
        'data-attribution': attribution,
        'data-url': url,
      }),

    Marker: ({ children, position, draggable, eventHandlers }) =>
      React.createElement(
        'div',
        {
          'data-testid': 'map-marker',
          'data-position': JSON.stringify(position),
          'data-draggable': String(draggable),
        },
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'drag-marker',
            onClick: () =>
              eventHandlers.dragend({
                target: {
                  getLatLng: () => ({
                    lat: -1.2901,
                    lng: 36.8202,
                  }),
                },
              }),
          },
          'Drag marker'
        ),
        children
      ),

    Popup: ({ children }) =>
      React.createElement('div', { 'data-testid': 'map-popup' }, children),

    useMapEvents: (events) => {
      mocks.mapEvents = events
    },
  }
})

describe('DeliveryLocationPicker', () => {
  beforeEach(() => {
    mocks.mapEvents = null
    vi.clearAllMocks()
  })

  it('renders the delivery location heading', () => {
    render(
      <DeliveryLocationPicker
        selectedLocation={null}
        onLocationSelect={vi.fn()}
      />
    )

    expect(
      screen.getByText('Select your delivery location')
    ).toBeInTheDocument()
  })

  it('displays instructions for selecting a location', () => {
    render(
      <DeliveryLocationPicker
        selectedLocation={null}
        onLocationSelect={vi.fn()}
      />
    )

    expect(
      screen.getByText(/Click on the map to place your delivery pin/)
    ).toBeInTheDocument()

    expect(
      screen.getByText(/You can drag the pin to adjust it/)
    ).toBeInTheDocument()
  })

  it('renders the map container', () => {
    render(
      <DeliveryLocationPicker
        selectedLocation={null}
        onLocationSelect={vi.fn()}
      />
    )

    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('uses the ShopEase shop coordinates as the map center', () => {
    render(
      <DeliveryLocationPicker
        selectedLocation={null}
        onLocationSelect={vi.fn()}
      />
    )

    expect(screen.getByTestId('map-container')).toHaveAttribute(
      'data-center',
      JSON.stringify([-1.28339, 36.82319])
    )
  })

  it('renders the OpenStreetMap tile layer', () => {
    render(
      <DeliveryLocationPicker
        selectedLocation={null}
        onLocationSelect={vi.fn()}
      />
    )

    expect(screen.getByTestId('tile-layer')).toHaveAttribute(
      'data-url',
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    )
  })

  it('does not display a marker when no location is selected', () => {
    render(
      <DeliveryLocationPicker
        selectedLocation={null}
        onLocationSelect={vi.fn()}
      />
    )

    expect(screen.queryByTestId('map-marker')).not.toBeInTheDocument()
  })

  it('displays a marker when a location is selected', () => {
    render(
      <DeliveryLocationPicker
        selectedLocation={{ lat: -1.2901, lng: 36.8202 }}
        onLocationSelect={vi.fn()}
      />
    )

    expect(screen.getByTestId('map-marker')).toBeInTheDocument()
  })

  it('displays the selected delivery coordinates', () => {
    render(
      <DeliveryLocationPicker
        selectedLocation={{ lat: -1.290123, lng: 36.820234 }}
        onLocationSelect={vi.fn()}
      />
    )

    expect(
      screen.getByText(/-1\.290123, 36\.820234/)
    ).toBeInTheDocument()
  })

  it('calls onLocationSelect when the map is clicked', () => {
    const onLocationSelect = vi.fn()

    render(
      <DeliveryLocationPicker
        selectedLocation={null}
        onLocationSelect={onLocationSelect}
      />
    )

    mocks.mapEvents.click({
      latlng: {
        lat: -1.295,
        lng: 36.825,
      },
    })

    expect(onLocationSelect).toHaveBeenCalledWith({
      lat: -1.295,
      lng: 36.825,
    })
  })

  it('updates the selected location when the marker is dragged', () => {
    const onLocationSelect = vi.fn()

    render(
      <DeliveryLocationPicker
        selectedLocation={{ lat: -1.2901, lng: 36.8202 }}
        onLocationSelect={onLocationSelect}
      />
    )

    fireEvent.click(screen.getByTestId('drag-marker'))

    expect(onLocationSelect).toHaveBeenCalledWith({
      lat: -1.2901,
      lng: 36.8202,
    })
  })

  it('makes the selected marker draggable', () => {
    render(
      <DeliveryLocationPicker
        selectedLocation={{ lat: -1.2901, lng: 36.8202 }}
        onLocationSelect={vi.fn()}
      />
    )

    expect(screen.getByTestId('map-marker')).toHaveAttribute(
      'data-draggable',
      'true'
    )
  })
})
