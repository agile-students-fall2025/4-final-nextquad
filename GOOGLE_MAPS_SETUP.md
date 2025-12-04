# Google Maps Integration Setup

This guide will help you set up Google Maps API integration for the campus map feature.

## Prerequisites

1. A Google Cloud Platform account
2. A Google Maps API key with the following APIs enabled:
   - Maps JavaScript API
   - Geocoding API

## Step 1: Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** (for displaying the map)
   - **Geocoding API** (for converting addresses to coordinates)
4. Go to "Credentials" and create an API key
5. (Optional but recommended) Restrict the API key to your domain

## Step 2: Configure Environment Variables

### Backend (.env file in `back-end/` directory)

Add your Google Maps API key:

```env
GOOGLE_MAPS_API_KEY=your_api_key_here
MONGODB_URI=your_mongodb_uri
```

### Frontend (.env file in `front-end/` directory)

Add your Google Maps API key:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Note:** Frontend environment variables must be prefixed with `REACT_APP_` to be accessible in React.

## Step 3: Seed the Database

Run the seed script to import locations from `mappins.json`:

```bash
cd back-end
npm run seed:mapsource
```

This will:
- Read all locations from `back-end/data/map/mappins.json`
- Import them into the `mapsource` collection in MongoDB
- Each location will be geocoded when first accessed (coordinates will be cached)

## Step 4: Start the Application

1. Start the backend server:
   ```bash
   cd back-end
   npm start
   ```

2. Start the frontend:
   ```bash
   cd front-end
   npm start
   ```

## How It Works

1. **Data Storage**: Locations are stored in the `mapsource` collection with addresses
2. **Geocoding**: When a location is requested, if it doesn't have coordinates, the address is geocoded using Google's Geocoding API
3. **Caching**: Geocoded coordinates are saved to the database to avoid repeated API calls
4. **Map Display**: The frontend uses Google Maps JavaScript API to display markers for each location

## Troubleshooting

### Map doesn't load
- Check that `REACT_APP_GOOGLE_MAPS_API_KEY` is set in your frontend `.env` file
- Verify the API key has the Maps JavaScript API enabled
- Check browser console for errors

### Locations don't appear
- Check that the database has been seeded: `npm run seed:mapsource`
- Check backend console for geocoding errors
- Verify `GOOGLE_MAPS_API_KEY` is set in your backend `.env` file
- Check that the Geocoding API is enabled in Google Cloud Console

### Geocoding fails
- Verify the Geocoding API is enabled in Google Cloud Console
- Check API key restrictions (if any)
- Check backend logs for specific error messages
- Locations will fall back to default NYU coordinates (40.7308, -73.9973) if geocoding fails

## API Costs

- **Maps JavaScript API**: Free tier includes 28,000 map loads per month
- **Geocoding API**: Free tier includes $200 credit per month (approximately 40,000 geocoding requests)

For development and small-scale use, the free tier should be sufficient.

