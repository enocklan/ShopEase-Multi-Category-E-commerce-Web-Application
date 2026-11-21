
const SHOP_LOCATION = {
  latitude: -1.28339,
  longitude: 36.82319,
}

export const calculateRoadDistance = async (destination) => {
  if (!destination?.lat || !destination?.lng) {
    throw new Error('Please select a valid delivery location.')
  }

  const { latitude, longitude } = SHOP_LOCATION

  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${longitude},${latitude};` +
    `${destination.lng},${destination.lat}?overview=false`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Unable to calculate delivery distance.')
  }

  const data = await response.json()

  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error('No driving route found for this location.')
  }

  // OSRM returns distance in metres.
  const distanceInMetres = data.routes[0].distance

  // Convert metres into kilometres.
  const distanceInKilometres = distanceInMetres / 1000

  return Number(distanceInKilometres.toFixed(2))
}
