// lib/map/osm.ts
// OpenStreetMap style definitions, tile sources, and projection helpers

export type OsmBasemapId = "osm" | "satellite" | "hybrid" | "topo";

/**
 * Builds standard OpenStreetMap map styles for MapLibre GL
 */
export function getOsmMapStyle(basemap: OsmBasemapId) {
  if (basemap === "osm") {
    return {
      version: 8 as const,
      sources: {
        "osm-standard": {
          type: "raster" as const,
          tiles: [
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution: "© <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap</a> contributors",
        },
      },
      layers: [
        {
          id: "osm-standard-layer",
          type: "raster" as const,
          source: "osm-standard",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };
  }

  if (basemap === "topo") {
    return {
      version: 8 as const,
      sources: {
        "osm-topo": {
          type: "raster" as const,
          tiles: [
            "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
            "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
            "https://c.tile.opentopomap.org/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution: "Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)",
        },
      },
      layers: [
        {
          id: "osm-topo-layer",
          type: "raster" as const,
          source: "osm-topo",
          minzoom: 0,
          maxzoom: 18,
        },
      ],
    };
  }

  // Satellite and Hybrid (Esri World Imagery, OpenStreetMap satellite imagery provider)
  return {
    version: 8 as const,
    sources: {
      "osm-satellite": {
        type: "raster" as const,
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "Tiles © Esri, Maxar, Earthstar Geographics, USDA, USGS — OpenStreetMap Satellite Partner",
      },
      ...(basemap === "hybrid"
        ? {
            "osm-boundaries": {
              type: "raster" as const,
              tiles: [
                "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
              ],
              tileSize: 256,
            },
          }
        : {}),
    },
    layers: [
      {
        id: "osm-satellite-layer",
        type: "raster" as const,
        source: "osm-satellite",
        minzoom: 0,
        maxzoom: 19,
      },
      ...(basemap === "hybrid"
        ? [
            {
              id: "osm-boundaries-layer",
              type: "raster" as const,
              source: "osm-boundaries",
              minzoom: 0,
              maxzoom: 19,
            },
          ]
        : []),
    ],
  };
}
