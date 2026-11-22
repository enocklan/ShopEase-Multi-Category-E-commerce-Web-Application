
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calculateRoadDistance } from '../deliveryService'

describe('calculateRoadDistance', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calculates driving distance in kilometres', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 'Ok',
        routes: [{ distance: 12500 }],
      }),
    })

    const result = await calculateRoadDistance({
      lat: -1.2921,
      lng: 36.8219,
    })

    expect(result).toBe(12.5)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('throws an error when destination is missing', async () => {
    await expect(calculateRoadDistance()).rejects.toThrow(
      'Please select a valid delivery location.'
    )
  })

  it('throws an error when latitude is missing', async () => {
    await expect(
      calculateRoadDistance({ lng: 36.8219 })
    ).rejects.toThrow('Please select a valid delivery location.')
  })

  it('throws an error when longitude is missing', async () => {
    await expect(
      calculateRoadDistance({ lat: -1.2921 })
    ).rejects.toThrow('Please select a valid delivery location.')
  })

  it('throws an error when the API response is unsuccessful', async () => {
    fetch.mockResolvedValue({
      ok: false,
    })

    await expect(
      calculateRoadDistance({ lat: -1.2921, lng: 36.8219 })
    ).rejects.toThrow('Unable to calculate delivery distance.')
  })

  it('throws an error when no driving route is found', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 'NoRoute',
        routes: [],
      }),
    })

    await expect(
      calculateRoadDistance({ lat: -1.2921, lng: 36.8219 })
    ).rejects.toThrow('No driving route found for this location.')
  })

  it('throws a network error when the fetch request fails', async () => {
    fetch.mockRejectedValue(new Error('Network error'))

    await expect(
      calculateRoadDistance({ lat: -1.2921, lng: 36.8219 })
    ).rejects.toThrow('Network error')
  })
})
