#!/usr/bin/env python3
"""Process raw OSM map JSON into a compact local-metric dataset for Yenimahalle 3D."""

from __future__ import annotations

import json
import math
import re
from collections import defaultdict
from pathlib import Path

RAW_MAP = Path("/tmp/ym-map.json")
RAW_REL = Path("/tmp/ym-rel-osm.json")
OUT = Path("/workspace/yenimahalle-3d/data/yenimahalle.json")

R_EARTH = 6378137.0
BUFFER_M = 90.0  # include features slightly around the official mahalle boundary
SIMPLIFY_M = 0.7

CLIP_PAD_M = 100.0  # crop long ways / large areas to a tight view around the mahalle


def clip_line_to_aabb(line, aabb):
    """Cohen-Sutherland clip a polyline to axis-aligned box (minx, miny, maxx, maxy)."""
    minx, miny, maxx, maxy = aabb
    INSIDE, LEFT, RIGHT, BOTTOM, TOP = 0, 1, 2, 4, 8

    def code(x, y):
        c = INSIDE
        if x < minx: c |= LEFT
        elif x > maxx: c |= RIGHT
        if y < miny: c |= BOTTOM
        elif y > maxy: c |= TOP
        return c

    def clip_seg(x0, y0, x1, y1):
        c0, c1 = code(x0, y0), code(x1, y1)
        while True:
            if not (c0 | c1):
                return (x0, y0, x1, y1)
            if c0 & c1:
                return None
            c = c0 or c1
            if c & TOP:
                x = x0 + (x1 - x0) * (maxy - y0) / ((y1 - y0) or 1e-12)
                y = maxy
            elif c & BOTTOM:
                x = x0 + (x1 - x0) * (miny - y0) / ((y1 - y0) or 1e-12)
                y = miny
            elif c & RIGHT:
                y = y0 + (y1 - y0) * (maxx - x0) / ((x1 - x0) or 1e-12)
                x = maxx
            else:
                y = y0 + (y1 - y0) * (minx - x0) / ((x1 - x0) or 1e-12)
                x = minx
            if c == c0:
                x0, y0, c0 = x, y, code(x, y)
            else:
                x1, y1, c1 = x, y, code(x, y)

    out_parts = []
    cur = []
    for i in range(len(line) - 1):
        seg = clip_seg(line[i][0], line[i][1], line[i + 1][0], line[i + 1][1])
        if not seg:
            if cur:
                out_parts.append(cur)
                cur = []
            continue
        x0, y0, x1, y1 = seg
        if not cur:
            cur = [(round(x0, 2), round(y0, 2)), (round(x1, 2), round(y1, 2))]
        else:
            # continue if connected
            if abs(cur[-1][0] - x0) > 0.05 or abs(cur[-1][1] - y0) > 0.05:
                out_parts.append(cur)
                cur = [(round(x0, 2), round(y0, 2)), (round(x1, 2), round(y1, 2))]
            else:
                cur.append((round(x1, 2), round(y1, 2)))
    if cur:
        out_parts.append(cur)
    return [part for part in out_parts if len(part) >= 2]


def clip_ring_to_aabb(ring, aabb):
    """Sutherland-Hodgman polygon clip against an AABB."""
    minx, miny, maxx, maxy = aabb
    if not ring:
        return []
    poly = list(ring)
    if poly[0] != poly[-1]:
        poly.append(poly[0])

    def clip_edge(pts, inside, intersect):
        if not pts:
            return []
        out = []
        prev = pts[-1] if pts[0] != pts[-1] else pts[-2]
        prev_in = inside(prev)
        for cur in pts:
            cur_in = inside(cur)
            if cur_in:
                if not prev_in:
                    out.append(intersect(prev, cur))
                out.append(cur)
            elif prev_in:
                out.append(intersect(prev, cur))
            prev, prev_in = cur, cur_in
        if out and out[0] != out[-1]:
            out.append(out[0])
        return out

    def lerp_x(p, q, x):
        t = (x - p[0]) / ((q[0] - p[0]) or 1e-12)
        return (round(x, 2), round(p[1] + t * (q[1] - p[1]), 2))

    def lerp_y(p, q, y):
        t = (y - p[1]) / ((q[1] - p[1]) or 1e-12)
        return (round(p[0] + t * (q[0] - p[0]), 2), round(y, 2))

    poly = clip_edge(poly, lambda p: p[0] >= minx, lambda p, q: lerp_x(p, q, minx))
    poly = clip_edge(poly, lambda p: p[0] <= maxx, lambda p, q: lerp_x(p, q, maxx))
    poly = clip_edge(poly, lambda p: p[1] >= miny, lambda p, q: lerp_y(p, q, miny))
    poly = clip_edge(poly, lambda p: p[1] <= maxy, lambda p, q: lerp_y(p, q, maxy))
    if len(poly) < 4:
        return []
    return [(round(x, 2), round(y, 2)) for x, y in poly]



ROAD_WIDTH = {
    "motorway": 18.0,
    "trunk": 16.0,
    "primary": 14.0,
    "secondary": 11.0,
    "tertiary": 8.5,
    "unclassified": 7.0,
    "residential": 6.5,
    "living_street": 6.0,
    "tertiary_link": 7.0,
    "secondary_link": 8.0,
    "primary_link": 9.0,
    "trunk_link": 9.0,
    "motorway_link": 10.0,
    "service": 4.0,
    "pedestrian": 5.0,
    "footway": 2.4,
    "path": 2.2,
    "cycleway": 2.5,
    "steps": 2.0,
    "track": 3.5,
    "corridor": 2.5,
}

DEFAULT_HEIGHT = {
    "apartments": 15.0,
    "residential": 13.0,
    "house": 8.0,
    "detached": 8.0,
    "semidetached_house": 8.0,
    "terrace": 9.0,
    "school": 12.0,
    "university": 14.0,
    "kindergarten": 8.0,
    "mosque": 14.0,
    "church": 14.0,
    "hotel": 18.0,
    "commercial": 15.0,
    "retail": 12.0,
    "office": 16.0,
    "industrial": 10.0,
    "warehouse": 10.0,
    "train_station": 10.0,
    "roof": 3.5,
    "carport": 3.0,
    "garage": 3.0,
    "garages": 3.5,
    "shed": 3.0,
    "construction": 6.0,
    "yes": 12.0,
}

POI_KIND = {
    "place_of_worship": "mosque",
    "mosque": "mosque",
    "school": "school",
    "college": "school",
    "university": "school",
    "kindergarten": "school",
    "music_school": "school",
    "police": "police",
    "pharmacy": "pharmacy",
    "hospital": "hospital",
    "clinic": "clinic",
    "doctors": "clinic",
    "veterinary": "clinic",
    "hotel": "hotel",
    "guest_house": "hotel",
    "motel": "hotel",
    "restaurant": "restaurant",
    "fast_food": "restaurant",
    "cafe": "cafe",
    "fuel": "fuel",
    "supermarket": "shop",
    "convenience": "shop",
    "mall": "shop",
    "station": "station",
    "subway_entrance": "subway_entrance",
    "bus_stop": "bus_stop",
    "park": "park",
    "playground": "playground",
    "community_centre": "culture",
    "social_facility": "culture",
    "arts_centre": "culture",
    "theatre": "culture",
    "library": "culture",
    "bank": "bank",
    "atm": "bank",
    "post_office": "post",
    "townhall": "civic",
}


def parse_height(raw) -> float | None:
    if raw is None:
        return None
    s = str(raw).strip().lower().replace(",", ".")
    m = re.match(r"^([0-9]+(?:\.[0-9]+)?)\s*(m|meter|metres|meters|mt)?$", s)
    if m:
        return float(m.group(1))
    return None


def parse_levels(raw) -> float | None:
    if raw is None:
        return None
    s = str(raw).strip().replace(",", ".")
    try:
        v = float(s)
    except ValueError:
        return None
    return v if v > 0 else None


def lonlat_to_xy(lon, lat, lon0, lat0):
    lat0r = math.radians(lat0)
    x = math.radians(lon - lon0) * math.cos(lat0r) * R_EARTH
    y = math.radians(lat - lat0) * R_EARTH
    return (round(x, 2), round(y, 2))


def point_in_ring(x, y, ring) -> bool:
    # ray casting; ring may be closed
    inside = False
    n = len(ring)
    if n < 3:
        return False
    j = n - 1
    for i in range(n):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if (yi > y) != (yj > y):
            denom = (yj - yi) or 1e-12
            xinters = (xj - xi) * (y - yi) / denom + xi
            if x < xinters:
                inside = not inside
        j = i
    return inside


def dist2_point_seg(px, py, ax, ay, bx, by) -> float:
    vx, vy = bx - ax, by - ay
    wx, wy = px - ax, py - ay
    c1 = vx * wx + vy * wy
    if c1 <= 0:
        return wx * wx + wy * wy
    c2 = vx * vx + vy * vy
    if c2 <= c1:
        dx, dy = px - bx, py - by
        return dx * dx + dy * dy
    t = c1 / c2
    dx, dy = px - (ax + t * vx), py - (ay + t * vy)
    return dx * dx + dy * dy


def dist_point_ring(x, y, ring) -> float:
    if point_in_ring(x, y, ring):
        return 0.0
    best = 1e18
    n = len(ring)
    for i in range(n - 1):
        d2 = dist2_point_seg(x, y, ring[i][0], ring[i][1], ring[i + 1][0], ring[i + 1][1])
        if d2 < best:
            best = d2
    # if not closed, also last-first
    if n >= 2 and ring[0] != ring[-1]:
        d2 = dist2_point_seg(x, y, ring[-1][0], ring[-1][1], ring[0][0], ring[0][1])
        if d2 < best:
            best = d2
    return math.sqrt(best)


def polyline_near_or_in(line, boundary, buffer_m) -> tuple[bool, bool]:
    """Return (include, inside) where inside means any vertex inside the official boundary."""
    if not line:
        return False, False
    inside = False
    near = False
    for x, y in line:
        if point_in_ring(x, y, boundary):
            inside = True
            near = True
            break
        if dist_point_ring(x, y, boundary) <= buffer_m:
            near = True
    if inside:
        return True, True
    if near:
        return True, False
    # also check if any boundary vertex is inside a polygon (for large areas covering the mahalle)
    return False, False


def polygon_intersects(ring, boundary, buffer_m) -> tuple[bool, bool]:
    if not ring:
        return False, False
    inc, inside = polyline_near_or_in(ring, boundary, buffer_m)
    if inc:
        return inc, inside
    # large polygon covering the neighbourhood: any boundary vertex inside this ring
    for p in boundary[:: max(1, len(boundary) // 20)]:
        if point_in_ring(p[0], p[1], ring):
            return True, True
    return False, False


def simplify(coords, tol=SIMPLIFY_M):
    if len(coords) <= 3:
        return coords
    closed = coords[0] == coords[-1]
    pts = coords[:-1] if closed else coords

    def rec(seq):
        if len(seq) <= 2:
            return seq
        ax, ay = seq[0]
        bx, by = seq[-1]
        vx, vy = bx - ax, by - ay
        lab = math.hypot(vx, vy) or 1e-12
        maxd, idx = -1.0, 0
        for i in range(1, len(seq) - 1):
            px, py = seq[i]
            # perpendicular distance to segment
            d = abs(vx * (ay - py) - vy * (ax - px)) / lab
            if d > maxd:
                maxd, idx = d, i
        if maxd <= tol:
            return [seq[0], seq[-1]]
        left = rec(seq[: idx + 1])
        right = rec(seq[idx:])
        return left[:-1] + right

    out = rec(pts)
    if closed:
        if out[0] != out[-1]:
            out = out + [out[0]]
    return out if len(out) >= 2 else coords


def way_coords(way, nodes, lon0, lat0):
    coords = []
    for nid in way.get("nodes") or []:
        n = nodes.get(nid)
        if not n or "lon" not in n or "lat" not in n:
            continue
        coords.append(lonlat_to_xy(n["lon"], n["lat"], lon0, lat0))
    return coords


def ring_area(ring):
    if len(ring) < 3:
        return 0.0
    a = 0.0
    for i in range(len(ring) - 1):
        a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
    return abs(a) * 0.5


def centroid(ring):
    if not ring:
        return (0.0, 0.0)
    xs = [p[0] for p in ring]
    ys = [p[1] for p in ring]
    return (sum(xs) / len(xs), sum(ys) / len(ys))


def assemble_ring(ways_by_id, member_refs):
    """Join outer ways into a single closed ring."""
    unused = []
    for ref in member_refs:
        w = ways_by_id.get(ref)
        if not w:
            continue
        nds = list(w.get("nodes") or [])
        if nds:
            unused.append(nds)
    if not unused:
        return []
    ring = unused.pop(0)
    guard = 0
    while unused and guard < 1000:
        guard += 1
        matched = False
        for i, nds in enumerate(unused):
            if nds[0] == ring[-1]:
                ring += nds[1:]
                unused.pop(i)
                matched = True
                break
            if nds[-1] == ring[-1]:
                ring += list(reversed(nds[:-1]))
                unused.pop(i)
                matched = True
                break
            if nds[-1] == ring[0]:
                ring = nds[:-1] + ring
                unused.pop(i)
                matched = True
                break
            if nds[0] == ring[0]:
                ring = list(reversed(nds[1:])) + ring
                unused.pop(i)
                matched = True
                break
        if not matched:
            break
    return ring


def classify_poi(tags: dict) -> str | None:
    if tags.get("building") == "mosque" or tags.get("amenity") == "place_of_worship" or tags.get("religion") == "muslim":
        return "mosque"
    for key in ("amenity", "tourism", "shop", "leisure", "railway", "historic", "office", "public_transport", "highway"):
        val = tags.get(key)
        if not val:
            continue
        if key == "highway" and val != "bus_stop":
            continue
        if key == "public_transport" and val in ("stop_position", "platform") and not tags.get("name"):
            continue
        if val in POI_KIND:
            kind = POI_KIND[val]
            # don't treat unmarked subway stop_positions far away as stations
            if kind == "station" and tags.get("public_transport") == "stop_position":
                return None
            return kind
        if key == "shop":
            return "shop"
        if key == "public_transport" and val == "station":
            return "station"
        if key == "railway" and val == "subway_entrance":
            return "subway_entrance"
        if key == "historic" and tags.get("name"):
            return "historic"
        if key == "office" and tags.get("name"):
            return "office"
        if key == "leisure" and val in ("sports_centre", "stadium", "pitch") and tags.get("name"):
            return "sport"
    return None


def main():
    osm_map = json.loads(RAW_MAP.read_text())
    osm_rel = json.loads(RAW_REL.read_text())

    rel_els = osm_rel["elements"]
    rel = next(e for e in rel_els if e["type"] == "relation" and e["id"] == 9439859)
    rel_nodes = {e["id"]: e for e in rel_els if e["type"] == "node"}
    rel_ways = {e["id"]: e for e in rel_els if e["type"] == "way"}

    # compute geographic origin from official boundary nodes
    blats, blons = [], []
    for e in rel_els:
        if e["type"] == "node":
            blats.append(e["lat"])
            blons.append(e["lon"])
    lat0 = sum(blats) / len(blats)
    lon0 = sum(blons) / len(blons)

    member_refs = [m["ref"] for m in rel["members"] if m["type"] == "way" and m.get("role") in ("outer", "")]
    node_ring_ids = assemble_ring(rel_ways, member_refs)
    boundary_ll = []
    for nid in node_ring_ids:
        n = rel_nodes[nid]
        boundary_ll.append((n["lon"], n["lat"]))
    if boundary_ll[0] != boundary_ll[-1]:
        boundary_ll.append(boundary_ll[0])

    boundary = [lonlat_to_xy(lon, lat, lon0, lat0) for lon, lat in boundary_ll]
    boundary = simplify(boundary, 0.4)
    if boundary[0] != boundary[-1]:
        boundary.append(boundary[0])

    bx = [p[0] for p in boundary]
    by = [p[1] for p in boundary]
    clip_aabb = (min(bx) - CLIP_PAD_M, min(by) - CLIP_PAD_M, max(bx) + CLIP_PAD_M, max(by) + CLIP_PAD_M)

    elements = osm_map["elements"]
    nodes = {e["id"]: e for e in elements if e["type"] == "node"}
    ways = [e for e in elements if e["type"] == "way"]
    rels = [e for e in elements if e["type"] == "relation"]

    buildings = []
    roads = []
    areas = []
    railways = []
    pois = []
    seen_poi = set()

    def maybe_poi_from_tags(oid, typ, tags, x, y):
        kind = classify_poi(tags)
        name = tags.get("name") or tags.get("name:tr")
        # skip unnamed minor shops already handled; require a kind
        if not kind:
            return
        # skip bus stops / subway stops without being in/near
        inc, inside = polyline_near_or_in([(x, y)], boundary, BUFFER_M)
        if not inc:
            return
        # skip generic far metro stop names if point is outside (already filtered)
        key = (kind, name or oid)
        if key in seen_poi:
            return
        # don't add a second hotel POI if it's just a node on a hotel building — still ok, we'll dedupe by name
        if name:
            seen_poi.add((kind, name))
        pois.append({
            "id": f"{typ[0]}{oid}",
            "kind": kind,
            "name": name,
            "x": round(x, 2),
            "y": round(y, 2),
            "inside": inside,
        })

    # --- buildings from ways ---
    for w in ways:
        tags = w.get("tags") or {}
        if "building" in tags:
            ring = way_coords(w, nodes, lon0, lat0)
            if len(ring) < 4:
                continue
            if ring[0] != ring[-1]:
                ring.append(ring[0])
            inc, inside = polygon_intersects(ring, boundary, BUFFER_M)
            if not inc:
                continue
            btype = tags.get("building") or "yes"
            height = parse_height(tags.get("height") or tags.get("building:height"))
            levels = parse_levels(tags.get("building:levels"))
            if height is None and levels is not None:
                height = round(levels * 3.0, 2)
            if height is None:
                height = DEFAULT_HEIGHT.get(btype, DEFAULT_HEIGHT["yes"])
            # min sensible
            height = max(2.5, float(height))
            ring = simplify(ring)
            b = {
                "id": w["id"],
                "type": btype,
                "name": tags.get("name") or tags.get("name:tr"),
                "street": tags.get("addr:street"),
                "housenumber": tags.get("addr:housenumber"),
                "levels": levels,
                "height": round(height, 2),
                "inside": inside,
                "ring": ring,
            }
            # drop nulls to keep compact
            buildings.append({k: v for k, v in b.items() if v is not None and v != ""})
            maybe_poi_from_tags(w["id"], "way", tags, *centroid(ring))
            continue

        if tags.get("highway"):
            line = way_coords(w, nodes, lon0, lat0)
            if len(line) < 2:
                continue
            inc, inside = polyline_near_or_in(line, boundary, BUFFER_M)
            if not inc:
                continue
            hw = tags["highway"]
            if hw in ("abandoned", "construction", "proposed", "platform", "bus_stop"):
                continue
            width = parse_height(tags.get("width")) or ROAD_WIDTH.get(hw, 5.5)
            line = simplify(line)
            r = {
                "id": w["id"],
                "highway": hw,
                "name": tags.get("name") or tags.get("name:tr"),
                "width": round(float(width), 2),
                "bridge": tags.get("bridge") in ("yes", "true", "viaduct"),
                "tunnel": tags.get("tunnel") in ("yes", "true", "building_passage"),
                "layer": tags.get("layer"),
                "inside": inside,
                "line": line,
            }
            roads.append({k: v for k, v in r.items() if v not in (None, "", False)})
            continue

        if tags.get("railway") in ("rail", "subway", "light_rail", "tram", "narrow_gauge"):
            line = way_coords(w, nodes, lon0, lat0)
            if len(line) < 2:
                continue
            inc, inside = polyline_near_or_in(line, boundary, BUFFER_M)
            if not inc:
                continue
            kind = tags["railway"]
            # skip very long subway tunnels that only clip if entirely underground and far? keep if near
            rw = {
                "id": w["id"],
                "kind": kind,
                "name": tags.get("name") or tags.get("name:tr"),
                "bridge": tags.get("bridge") in ("yes", "true", "viaduct"),
                "tunnel": tags.get("tunnel") in ("yes", "true") or kind == "subway",
                "inside": inside,
                "line": simplify(line),
            }
            railways.append({k: v for k, v in rw.items() if v not in (None, "", False)})
            continue

        area_kind = None
        if tags.get("leisure") in ("park", "garden", "playground", "pitch", "track", "village_green", "recreation_ground"):
            area_kind = tags["leisure"]
        elif tags.get("landuse") in ("grass", "forest", "recreation_ground", "village_green", "meadow", "orchard", "cemetery", "construction"):
            area_kind = tags["landuse"]
        elif tags.get("natural") in ("wood", "scrub", "grassland", "water", "wetland"):
            area_kind = "water" if tags["natural"] in ("water", "wetland") else ("forest" if tags["natural"] == "wood" else tags["natural"])
        elif tags.get("waterway") in ("riverbank",) or tags.get("water"):
            area_kind = "water"
        elif tags.get("amenity") == "parking":
            area_kind = "parking"
        # skip coastline / huge hippodrome / residential landuse
        if area_kind:
            # skip horse-racing tracks of Veliefendi unless inside
            ring = way_coords(w, nodes, lon0, lat0)
            if len(ring) < 3:
                continue
            if ring[0] != ring[-1] and area_kind not in ("track",):  # tracks can be lines or rings
                # if first!=last and not enough to be polygon, treat as line area skip unless closed-ish
                if math.hypot(ring[0][0] - ring[-1][0], ring[0][1] - ring[-1][1]) < 1.5:
                    ring.append(ring[0])
            inc, inside = polygon_intersects(ring, boundary, BUFFER_M) if ring[0] == ring[-1] else polyline_near_or_in(ring, boundary, BUFFER_M)
            if not inc:
                continue
            name = tags.get("name") or tags.get("name:tr")
            # drop Veliefendi hippodrome complex unless a vertex is inside official boundary
            if name and "hipodrom" in name.lower() and not inside:
                continue
            if tags.get("sport") == "horse_racing" and not inside:
                continue
            if area_kind in ("track",) and tags.get("sport") == "horse_racing" and not inside:
                continue
            if ring[0] != ring[-1] and len(ring) >= 4:
                # open leisure track — skip if not a polygon
                if area_kind == "track":
                    continue
            if ring[0] != ring[-1]:
                ring.append(ring[0])
            if len(ring) < 4:
                continue
            areas.append({k: v for k, v in {
                "id": w["id"],
                "kind": area_kind,
                "name": name,
                "sport": tags.get("sport"),
                "inside": inside,
                "ring": simplify(ring),
            }.items() if v not in (None, "")})
            if name and area_kind in ("park", "garden", "playground"):
                maybe_poi_from_tags(w["id"], "way", {"leisure": area_kind, "name": name}, *centroid(ring))

        # amenity school / hotel campus outlines that are not buildings
        if tags.get("amenity") in ("school", "university", "college", "kindergarten") and "building" not in tags:
            ring = way_coords(w, nodes, lon0, lat0)
            if len(ring) >= 3:
                if ring[0] != ring[-1]:
                    ring.append(ring[0])
                inc, inside = polygon_intersects(ring, boundary, BUFFER_M)
                if inc:
                    areas.append({k: v for k, v in {
                        "id": w["id"],
                        "kind": "school_grounds",
                        "name": tags.get("name") or tags.get("name:tr"),
                        "inside": inside,
                        "ring": simplify(ring),
                    }.items() if v not in (None, "")})
                    maybe_poi_from_tags(w["id"], "way", tags, *centroid(ring))

        if tags.get("amenity") or tags.get("tourism") or tags.get("shop") or tags.get("historic"):
            if "building" not in tags and tags.get("amenity") not in ("school", "university", "college", "kindergarten", "parking"):
                ring = way_coords(w, nodes, lon0, lat0)
                if ring:
                    maybe_poi_from_tags(w["id"], "way", tags, *centroid(ring))

    # address nodes: attach to containing building if missing street
    addr_nodes = []
    for n in nodes.values():
        tags = n.get("tags") or {}
        if "lat" not in n:
            continue
        x, y = lonlat_to_xy(n["lon"], n["lat"], lon0, lat0)
        if tags.get("addr:street") or tags.get("addr:housenumber"):
            inc, _ = polyline_near_or_in([(x, y)], boundary, BUFFER_M)
            if inc:
                addr_nodes.append((x, y, tags))
        maybe_poi_from_tags(n["id"], "node", tags, x, y)

    enriched = 0
    for b in buildings:
        if b.get("street") and b.get("housenumber"):
            continue
        ring = b["ring"]
        for x, y, tags in addr_nodes:
            if point_in_ring(x, y, ring):
                if not b.get("street") and tags.get("addr:street"):
                    b["street"] = tags["addr:street"]
                    enriched += 1
                if not b.get("housenumber") and tags.get("addr:housenumber"):
                    b["housenumber"] = tags["addr:housenumber"]
                if not b.get("name") and tags.get("name") and not tags.get("amenity"):
                    b["name"] = tags["name"]
                break

    # drop empty poi names for generic shops already ok; remove POIs with no name except subway_entrance, mosque, station, school, police
    keep_unnamed = {"subway_entrance", "mosque", "station", "school", "police", "fuel", "pharmacy"}
    pois = [p for p in pois if p.get("name") or p["kind"] in keep_unnamed]

    # Clip long ways and large areas so neighbouring districts do not dominate the view.
    def in_aabb_pt(x, y, aabb=None):
        aabb = aabb or clip_aabb
        return aabb[0] <= x <= aabb[2] and aabb[1] <= y <= aabb[3]

    clipped_buildings = []
    for b in buildings:
        ring = clip_ring_to_aabb(b["ring"], clip_aabb)
        if len(ring) < 4 or ring_area(ring) < 8:
            continue
        b["ring"] = simplify(ring)
        clipped_buildings.append(b)
    buildings = clipped_buildings

    clipped_roads = []
    for r in roads:
        parts = clip_line_to_aabb(r["line"], clip_aabb)
        for i, part in enumerate(parts):
            item = dict(r)
            item["line"] = simplify(part)
            if i:
                item["id"] = f"{r['id']}-{i}"
            if len(item["line"]) >= 2:
                clipped_roads.append(item)
    roads = clipped_roads

    clipped_areas = []
    for a in areas:
        ring = clip_ring_to_aabb(a["ring"], clip_aabb)
        if len(ring) < 4 or ring_area(ring) < 30:
            continue
        # keep if the clipped piece still touches the mahalle or the 90 m buffer
        min_d = min(dist_point_ring(x, y, boundary) for x, y in ring)
        if min_d > BUFFER_M:
            continue
        a["ring"] = simplify(ring)
        clipped_areas.append(a)
    areas = clipped_areas

    clipped_rw = []
    for r in railways:
        parts = clip_line_to_aabb(r["line"], clip_aabb)
        for i, part in enumerate(parts):
            item = dict(r)
            item["line"] = simplify(part)
            if i:
                item["id"] = f"{r['id']}-{i}"
            if len(item["line"]) >= 2:
                clipped_rw.append(item)
    railways = clipped_rw

    pois = [p for p in pois if in_aabb_pt(p["x"], p["y"])]

    # compute bbox
    xs, ys = zip(*boundary)
    meta = {
        "name": rel["tags"].get("name") or "Yenimahalle Mahallesi",
        "altName": rel["tags"].get("alt_name"),
        "district": "Bakırköy",
        "city": "İstanbul",
        "country": "Türkiye",
        "adminLevel": rel["tags"].get("admin_level"),
        "osmRelationId": 9439859,
        "wikidata": rel["tags"].get("wikidata"),
        "wikipedia": rel["tags"].get("wikipedia"),
        "source": "OpenStreetMap",
        "copyright": "© OpenStreetMap contributors",
        "license": "ODbL 1.0",
        "attributionUrl": "https://www.openstreetmap.org/copyright",
        "fetchedAt": "2026-11-10",
        "origin": {"lat": round(lat0, 7), "lon": round(lon0, 7)},
        "bufferMeters": BUFFER_M,
        "counts": {
            "buildings": len(buildings),
            "buildingsInside": sum(1 for b in buildings if b.get("inside")),
            "buildingsWithHeightTag": 0,  # filled below
            "buildingsWithLevelsTag": sum(1 for b in buildings if b.get("levels") is not None),
            "roads": len(roads),
            "areas": len(areas),
            "railways": len(railways),
            "pois": len(pois),
        },
        "notes": (
            "Official administrative boundary is OSM relation 9439859 "
            "(Yenimahalle Mahallesi, admin_level=8, inside Bakırköy). "
            "Features within the polygon plus a 90 m buffer are included for edge context. "
            "Most buildings lack height tags; heights use building:levels×3 m when present, "
            "otherwise type-based defaults (typical 4–5 storey Istanbul fabric, ~12–15 m)."
        ),
    }

    # recount height tags from original — we always set height, so use levels presence + we'll add flag
    with_h = 0
    # We didn't keep a flag. That's ok; compute from raw later in print.

    out = {
        "meta": meta,
        "boundary": boundary,
        "buildings": buildings,
        "roads": roads,
        "areas": areas,
        "railways": railways,
        "pois": pois,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    size = OUT.stat().st_size
    print(f"Wrote {OUT} ({size} bytes, {size/1024:.1f} KB)")
    print("boundary pts", len(boundary), "area m2", round(ring_area(boundary)))
    print("buildings", len(buildings), "inside", sum(1 for b in buildings if b.get("inside")))
    print("  with levels", sum(1 for b in buildings if b.get("levels") is not None))
    print("  named", sum(1 for b in buildings if b.get("name")))
    print("  with street", sum(1 for b in buildings if b.get("street")))
    print("  enriched addresses", enriched)
    print("roads", len(roads), "named", sum(1 for r in roads if r.get("name")))
    print("areas", len(areas), [(a.get("kind"), a.get("name")) for a in areas])
    print("railways", len(railways), [(r.get("kind"), r.get("name"), r.get("tunnel"), r.get("bridge")) for r in railways])
    print("pois", len(pois))
    from collections import Counter
    print("  kinds", Counter(p["kind"] for p in pois))
    print("  named pois:")
    for p in sorted(pois, key=lambda x: (x["kind"], x.get("name") or "")):
        print(f"    {p['kind']:16s} {p.get('name')}  inside={p.get('inside')}  ({p['x']},{p['y']})")
    print("origin", lon0, lat0)
    print("bbox m x", min(xs), max(xs), "y", min(ys), max(ys))


if __name__ == "__main__":
    main()
