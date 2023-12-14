import { Spinner, Flex, Button } from "@chakra-ui/react";

export default function LoadMoreButton({ loadMore, data, isLoadingMore }) {
  const isReachingEnd = data && !data[data.length - 1].hasNextPage;

  return (
    <Flex justifyContent="center" my="100px">
      <Button onClick={loadMore} disabled={isReachingEnd || isLoadingMore}>
        {isLoadingMore ? (
          <Spinner />
        ) : isReachingEnd ? (
          "That's all!"
        ) : (
          "Show more..."
        )}
      </Button>
    </Flex>
  );
}
