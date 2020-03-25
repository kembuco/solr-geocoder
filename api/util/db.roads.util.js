const database = require('../services/database.service');

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