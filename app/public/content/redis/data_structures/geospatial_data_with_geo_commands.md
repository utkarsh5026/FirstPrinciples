# Redis Geospatial Data with GEO Commands: A First Principles Approach

I'll explain Redis geospatial capabilities from first principles, building up the concepts step by step with detailed examples.

## Understanding Geospatial Data: The Fundamentals

At its core, geospatial data represents locations on Earth. Before diving into Redis's implementation, let's understand what this means.

### The Earth as a Sphere (Almost)

The Earth is approximately spherical. To identify a location on this sphere, we use two primary coordinates:

1. **Latitude** : The angular distance north or south from the equator (ranges from -90° to 90°)
2. **Longitude** : The angular distance east or west from the Prime Meridian (ranges from -180° to 180°)

For example, New York City is at approximately 40.7128° N, 74.0060° W (or 40.7128, -74.0060).

### The Challenge of Distance Calculation

On a sphere, calculating distance between two points isn't as simple as using the Pythagorean theorem. Instead, we need to use formulas like the Haversine formula, which accounts for the Earth's curvature.

## Redis GEO: Core Concepts

Redis implements geospatial features through specialized commands and data structures, allowing us to:

1. Store locations
2. Calculate distances between locations
3. Find locations within a radius
4. Find locations within a rectangle
5. Find the closest locations to a given point

### How Redis Stores Geospatial Data

Redis stores geospatial data in a sorted set using a technique called  **Geohash** . This is crucial to understand for what follows.

#### Geohashing: A Brief Explanation

Geohashing is a system that encodes a geographic location into a short string of letters and digits. It works by:

1. Dividing the world into a grid
2. Recursively subdividing each cell
3. Assigning a character to each subdivision
4. Creating a string representing increasingly precise locations

Redis uses a 52-bit geohash internally, which provides high precision.

### Redis GEO Commands

Now let's explore the actual Redis GEO commands through practical examples.

## Example 1: Adding Locations with GEOADD

The `GEOADD` command adds geographic locations to a Redis key. Let's add some major cities:

```redis
GEOADD cities 13.361389 38.115556 "Palermo" 15.087269 37.502669 "Catania"
```

Breaking down what this does:

* `GEOADD` is the command
* `cities` is the key (a sorted set)
* `13.361389 38.115556` are the longitude and latitude coordinates (notice longitude comes first!)
* `"Palermo"` is the member name for this location

Let's add more cities:

```redis
GEOADD cities 2.3522 48.8566 "Paris" -0.1278 51.5074 "London" -74.0060 40.7128 "New York"
```

Behind the scenes, Redis:

1. Converts each coordinate pair to a geohash
2. Stores each member in a sorted set with the geohash as the score

## Example 2: Finding Distances with GEODIST

The `GEODIST` command calculates the distance between two locations:

```redis
GEODIST cities "Palermo" "Catania"
```

This returns the distance in meters (by default). But we can specify the unit:

```redis
GEODIST cities "Palermo" "Catania" km
```

Redis supports these units:

* `m` (meters, default)
* `km` (kilometers)
* `mi` (miles)
* `ft` (feet)

Let's calculate the distance between cities on different continents:

```redis
GEODIST cities "London" "New York" km
```

This calculation takes into account the Earth's curvature using the Haversine formula.

## Example 3: Finding Locations within a Radius with GEORADIUS

The `GEORADIUS` command finds all locations within a specified radius of a point:

```redis
GEORADIUS cities 15 37 200 km
```

This finds all cities within 200 km of the point at longitude 15, latitude 37.

We can enhance this with additional options:

```redis
GEORADIUS cities 15 37 200 km WITHDIST WITHCOORD COUNT 3 ASC
```

Breaking down the options:

* `WITHDIST`: Returns the distance of each match
* `WITHCOORD`: Returns the coordinates of each match
* `COUNT 3`: Limits results to 3 items
* `ASC`: Sorts results by distance (ascending)

The output would look like:

```
1) 1) "Catania"
   2) "56.4413"
   3) 1) "15.087269"
      2) "37.502669"
2) 1) "Palermo"
   2) "190.4424"
   3) 1) "13.361389"
      2) "38.115556"
```

## Example 4: Finding Locations by Member with GEORADIUSBYMEMBER

Instead of specifying coordinates, we can find locations around an existing member:

```redis
GEORADIUSBYMEMBER cities "Paris" 1000 km
```

This finds all cities within 1000 km of Paris.

## Example 5: Getting Coordinates with GEOPOS

The `GEOPOS` command returns the coordinates of specified members:

```redis
GEOPOS cities "Palermo" "Catania" "NonExistingCity"
```

This would return:

```
1) 1) "13.36138933897018433"
   2) "38.11555639549629859"
2) 1) "15.08726745843887329"
   2) "37.50266842333162032"
3) (nil)
```

Notice that for non-existing cities, Redis returns `nil`.

## Example 6: Converting to Geohash with GEOHASH

The `GEOHASH` command returns the geohash string representation:

```redis
GEOHASH cities "Palermo" "Catania"
```

This might return:

```
1) "sqc8b49rny0"
2) "sqdtr74hyu0"
```

These strings can be used with geohashing libraries or online tools to visualize the locations.

## Example 7: Finding Locations within a Rectangle with GEOSEARCH

In Redis 6.2+, the `GEOSEARCH` command allows searching by radius or rectangle:

```redis
GEOSEARCH cities FROMLONLAT 15 37 BYBOX 400 400 km
```

This finds all cities within a 400km × 400km box centered at coordinates 15, 37.

## Example 8: Storing Results in a New Key with GEOSEARCHSTORE

The `GEOSEARCHSTORE` command (Redis 6.2+) performs a search and stores results:

```redis
GEOSEARCHSTORE southern_cities cities FROMLONLAT 15 37 BYRADIUS 300 km
```

This searches for cities within 300km of point (15, 37) and stores them in a new key called `southern_cities`.

## Example 9: Using Geospatial Data for a Simple Location-Based App

Let's create a simple example of a location-based app that finds nearby restaurants:

```redis
# Add some restaurants with their coordinates
GEOADD restaurants 2.3522 48.8566 "Le Bon Goût" 
GEOADD restaurants 2.3622 48.8666 "Chez Michel"
GEOADD restaurants 2.3722 48.8766 "Pasta Paradise"
GEOADD restaurants 2.3822 48.8866 "Sushi Time"
GEOADD restaurants 2.3922 48.8966 "Burger Place"

# Find restaurants within 2km of a user's location
GEORADIUS restaurants 2.3622 48.8666 2 km WITHDIST
```

The result might be:

```
1) 1) "Chez Michel"
   2) "0.0000"
2) 1) "Le Bon Goût"
   2) "1.4712"
3) 1) "Pasta Paradise"
   2) "1.5031"
```

This shows that "Chez Michel" is at the exact location, while "Le Bon Goût" and "Pasta Paradise" are within 2km.

## Internal Implementation Details

Understanding how Redis implements geospatial features internally helps appreciate its efficiency:

1. **Storage** : Redis uses sorted sets (ZSETs) to store geospatial data
2. **Conversion** : Coordinates are converted to 52-bit geohashes
3. **Distance Calculation** : Uses the Haversine formula for spherical distance
4. **Indexing** : Uses the geohash as a score in the sorted set for efficient range queries

## Performance Considerations

Redis geospatial operations are generally efficient, but there are some things to consider:

1. **Memory Usage** : Each member with coordinates requires about 80-90 bytes
2. **Time Complexity** :

* `GEOADD` is O(log(N)) where N is the number of elements
* `GEORADIUS` is O(N+log(M)) where N is the number of elements in the radius and M is the total

## Limitations and Considerations

1. **Precision** : Redis uses a 52-bit geohash, providing high but not infinite precision
2. **Edge Cases** : Very close to poles or antimeridian might have precision issues
3. **Earth Model** : Redis assumes a spherical Earth (not accounting for elevation)

## Practical Application: Location-Based Recommendations

Let's build a slightly more complex example of a coffee shop finder:

```redis
# Add coffee shops with their names and coordinates
GEOADD coffee_shops -122.4194 37.7749 "SF Coffee"
GEOADD coffee_shops -122.4104 37.7829 "Bean There"
GEOADD coffee_shops -122.4144 37.7919 "Espresso Express"
GEOADD coffee_shops -122.4004 37.7889 "Morning Brew"

# A user is at location (-122.4134, 37.7839)
# Find coffee shops within 1km, sorted by distance
GEORADIUS coffee_shops -122.4134 37.7839 1 km WITHDIST WITHCOORD ASC
```

The output might be:

```
1) 1) "Bean There"
   2) "0.3543"
   3) 1) "-122.41039961576462"
      2) "37.78289953765779"
2) 1) "Espresso Express"
   2) "0.8564"
   3) 1) "-122.41439968049526"
      2) "37.79189947892776"
```

This shows that "Bean There" is closest (0.35km away), followed by "Espresso Express" (0.86km away).

## Conclusion

Redis geospatial commands provide powerful tools for location-based applications. Starting from basic geographic principles, we've explored how Redis implements these features efficiently using geohashes and sorted sets. Through practical examples, we've seen how to:

1. Store locations
2. Calculate distances
3. Find locations within a radius or rectangle
4. Build simple location-based applications

These capabilities make Redis an excellent choice for applications requiring real-time geospatial operations, such as ride-sharing services, delivery apps, social networks with location features, and more.

The beauty of Redis GEO commands is that they abstract away the complex mathematics of geospatial calculations while providing excellent performance, all within the familiar Redis interface.
