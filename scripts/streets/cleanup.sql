-- STEP 1 - Get rid of no names
delete
from street
where 
    name is null 
    and ref is null;

-- STEP 2 - Get rid of tiny streets
delete
from street
where fclass not in (
    'motorway',
    'trunk',
    'primary',
    'secondary',
    'tertiary',
    'unclassified',
    'residential',
    'living_street',
    'pedestrian',
    'motorway_link',
    'trunk_link',
    'primary_link',
    'secondary_link'
);

-- STEP 3 - Set name field to ref value if name is null
update street set name = regexp_replace(ref, ';.*$', '') where name is null;
update street set name = regexp_replace(ref, ';.*$', '') where name like '%;%' and ref = name;

-- STEP 4 - Find an intersection
-- select
--     a.name as lname
--     , b.name AS rname
--     ,st_astext(st_intersection(a.geometry, b.geometry)) as intersection
-- from 
--     streets a,
--     streets b
-- where 
--     a.name = '16th Street Mall'
--     and b.name = 'California Street'
--     AND st_intersects(a.geometry, b.geometry)
-- order by
--     a.name asc,
--     b.name asc

-- select distinct on (street_a.name, street_b.name)
--     street_a.name
--     , street_b.name
--     , st_astext(st_intersection(street_a.geometry, street_b.geometry)) as intersection
-- from 
--     streets street_a,
--     streets street_b
-- where 
--     street_a.gid in (10800)
--     and street_b.gid in (101078)
--     AND st_intersects(street_a.geometry, street_b.geometry)
-- order by
--     street_a.name asc,
--     street_b.name asc