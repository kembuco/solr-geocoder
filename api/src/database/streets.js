const database = require('../providers/database.provider');

exports.findIntersections = async function findIntersections( leftIds, rightIds ) {
  const { rows } = await database.query(`
    SELECT DISTINCT ON (streets_a.name, streets_b.name)
      streets_a.name leftname,
      streets_b.name rightname,
      st_asgeojson(st_intersection(streets_a.geometry, streets_b.geometry)) as point
    FROM 
      street streets_a,
      street streets_b
    WHERE 
      streets_a.gid in (${leftIds.join(',')})
      AND streets_b.gid in (${rightIds.join(',')})
      AND st_intersects(streets_a.geometry, streets_b.geometry)
    ORDER BY
      streets_a.name asc,
      streets_b.name asc
  `);

  return rows.map(({ leftname, rightname, point }) => {
    const { coordinates } = JSON.parse(point);
    
    return {
      gaddr: `${leftname} & ${rightname}`,
      lat: coordinates[1],
      long: coordinates[0],
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