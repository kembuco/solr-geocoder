const database = require('../providers/database.provider');

exports.findIntersections = async function findIntersections( leftIds, rightIds ) {
  const { rows } = await database.query(`
    SELECT DISTINCT ON (roads_a.name, roads_b.name)
      roads_a.name leftname,
      roads_b.name rightname,
      st_asgeojson(st_intersection(roads_a.geometry, roads_b.geometry)) as point
    FROM 
      roads roads_a,
      roads roads_b
    WHERE 
      roads_a.gid in (${leftIds.join(',')})
      AND roads_b.gid in (${rightIds.join(',')})
      AND st_intersects(roads_a.geometry, roads_b.geometry)
    ORDER BY
      roads_a.name asc,
      roads_b.name asc
  `);

  return rows.map(({ leftname, rightname, point }) => {
    const { coordinates } = JSON.parse(point);
    
    return {
      AddrComplete: `${leftname} & ${rightname}`,
      Latitude: coordinates[1],
      Longitude: coordinates[0],
      score: -1
    }
  });
}

/**
 * Query to find an address based on OSM line and point data:

    select
        pop.osm_id as popid,
        pol.osm_id as polid,
        pop."addr:housenumber" street_number,
        pol.name as street_name,
        st_asgeojson(st_transform(pop.way, 4326)) as point,
        st_asgeojson(st_transform(pol.way, 4326)) as line
    from 
        planet_osm_point pop,
        planet_osm_line pol
    where
        st_dwithin(pop.way, pol.way, 20) and
        pol.name = 'Sheridan Boulevard' AND
        pop."addr:housenumber" = '5136';
 */