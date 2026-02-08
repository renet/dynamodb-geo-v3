import { QueryRadiusInput, QueryRectangleInput } from "../types";
import { S2LatLng, S2LatLngRect } from "nodes2ts";

export class S2Util {
  public static latLngRectFromQueryRectangleInput(
    geoQueryRequest: QueryRectangleInput
  ): S2LatLngRect {
    const queryRectangleRequest = geoQueryRequest as QueryRectangleInput;

    const minPoint = queryRectangleRequest.MinPoint;
    const maxPoint = queryRectangleRequest.MaxPoint;

    let latLngRect: S2LatLngRect = null;

    if (minPoint != null && maxPoint != null) {
      // Normalize longitude to [-180, 180] range to handling antimeridian crossing
      let minLng = minPoint.longitude;
      let maxLng = maxPoint.longitude;

      while (minLng < -180) minLng += 360;
      while (minLng > 180) minLng -= 360;
      while (maxLng < -180) maxLng += 360;
      while (maxLng > 180) maxLng -= 360;

      const minLatLng = S2LatLng.fromDegrees(
        minPoint.latitude,
        minLng
      );
      const maxLatLng = S2LatLng.fromDegrees(
        maxPoint.latitude,
        maxLng
      );

      latLngRect = S2LatLngRect.fromLatLng(minLatLng, maxLatLng);
    }
    return latLngRect;
  }

  public static getBoundingLatLngRectFromQueryRadiusInput(
    geoQueryRequest: QueryRadiusInput
  ): S2LatLngRect {
    const centerPoint = geoQueryRequest.CenterPoint;
    const radiusInMeter = geoQueryRequest.RadiusInMeter;

    const centerLatLng = S2LatLng.fromDegrees(
      centerPoint.latitude,
      centerPoint.longitude
    );

    const latReferenceUnit = centerPoint.latitude > 0.0 ? -1.0 : 1.0;
    const latReferenceLatLng = S2LatLng.fromDegrees(
      centerPoint.latitude + latReferenceUnit,
      centerPoint.longitude
    );
    const lngReferenceUnit = centerPoint.longitude > 0.0 ? -1.0 : 1.0;
    const lngReferenceLatLng = S2LatLng.fromDegrees(
      centerPoint.latitude,
      centerPoint.longitude + lngReferenceUnit
    );

    const latForRadius =
      radiusInMeter / centerLatLng.getEarthDistance(latReferenceLatLng);
    const lngForRadius =
      radiusInMeter / centerLatLng.getEarthDistance(lngReferenceLatLng);

    let minLng = centerPoint.longitude - lngForRadius;
    let maxLng = centerPoint.longitude + lngForRadius;

    // Normalize longitude to [-180, 180] range to handling antimeridian crossing
    // If the bounding box crosses the antimeridian, minLng will be > maxLng after normalization
    while (minLng < -180) minLng += 360;
    while (minLng > 180) minLng -= 360;
    while (maxLng < -180) maxLng += 360;
    while (maxLng > 180) maxLng -= 360;

    const minLatLng = S2LatLng.fromDegrees(
      centerPoint.latitude - latForRadius,
      minLng
    );
    const maxLatLng = S2LatLng.fromDegrees(
      centerPoint.latitude + latForRadius,
      maxLng
    );

    return S2LatLngRect.fromLatLng(minLatLng, maxLatLng);
  }
}
