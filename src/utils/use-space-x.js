import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

const spaceXApiBase = process.env.REACT_APP_SPACEX_API_URL;

export const queryFetcher = async (objectType, payload) => {
  const response = await fetch(`${spaceXApiBase}/${objectType}/query`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw Error(response.statusText);
  }
  return await response.json();
};

export function useSpaceXQuery(objectType, payload) {
  return useSWR(objectType ? [objectType, payload] : null, queryFetcher);
}

export function useSpaceXPaginatedQuery(objectType, payload) {
  return useSWRInfinite((_pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.hasNextPage) {
      return null;
    }

    const offset = previousPageData
      ? previousPageData.offset + previousPageData.limit
      : 0;

    return [
      objectType,
      { ...payload, options: { ...payload.options, offset } },
    ];
  }, queryFetcher);
}
