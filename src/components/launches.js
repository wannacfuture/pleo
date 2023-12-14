import { Badge, Box, Image, SimpleGrid, Text, Flex, IconButton, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, DrawerFooter, Button, Input } from "@chakra-ui/react";
import { format as timeAgo } from "timeago.js";
import { useNavigate } from "react-router-dom";
import { useDebounce } from 'use-debounce';
import { StarIcon } from '@chakra-ui/icons'

import { useSpaceXPaginatedQuery } from "../utils/use-space-x";
import { formatDate } from "../utils/format-date";
import Error from "./error";
import Breadcrumbs from "./breadcrumbs";
import LoadMoreButton from "./load-more-button";
import { addItem, getItems, removeItem } from "../utils/storage"
import { useEffect, useState } from "react";

const PAGE_SIZE = 12;

export default function Launches() {
  const { data, error, isValidating, setSize } = useSpaceXPaginatedQuery(
    "launches",
    {
      query: { upcoming: false },
      options: {
        limit: PAGE_SIZE,
        populate: ["rocket", "launchpad"],
        sort: { date_utc: "desc" },
      },
    }
  );

  const [favorites, setFavorites] = useState(getItems("launches"));
  const [filteredData, setFilteredData] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 1000);

  useEffect( ()=> {
    const uppderCasedQuery = debouncedSearchQuery.toUpperCase();
    const res = (data ?? [])
    .map((page) => page.docs)
    .flat()
    .filter(launch => launch.rocket?.name.toUpperCase().includes(uppderCasedQuery) || launch.launchpad?.name.toUpperCase().includes(uppderCasedQuery) || launch.name.toUpperCase().includes(uppderCasedQuery));
    console.log(res);
    setFilteredData(res);
  },[data,debouncedSearchQuery])

  const navigate = useNavigate();

  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "Launches" }]}
      />
      <div style={{display: "flex", justifyContent: "space-between"}}>
        <Button variant='outline' ml={6} onClick={() => setIsDrawerOpen(true)}>
          Show Favorites
        </Button>
        <Input placeholder="Search everything" w={300} mr={6} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}></Input>
      </div>
      <SimpleGrid m={[2, null, 6]} minChildWidth="350px" spacing="4">
        {error && <Error />}
        {filteredData
          .map((launch) => (
            <LaunchItem launch={launch} key={launch.id} isFavorite={favorites.includes(launch.id)} onStarClick={() => {
              const isAlreadyIncluded = favorites.includes(launch.id);
              if(isAlreadyIncluded) removeItem("launches", launch.id);
              else addItem("launches", launch.id)
              setFavorites(getItems("launches"));
            }} />
          ))}
      </SimpleGrid>
      <LoadMoreButton
        loadMore={() => setSize((size) => size + 1)}
        data={data}
        pageSize={PAGE_SIZE}
        isLoadingMore={isValidating}
      />
      <Drawer
        isOpen={isDrawerOpen}
        placement='right'
        onClose={() => setIsDrawerOpen(false)}
      >
        <DrawerOverlay />
        <DrawerContent w={700} maxWidth={700}>
          <DrawerCloseButton />
          <DrawerHeader>Favorite Launches({`${favorites.length}`})</DrawerHeader>

          <DrawerBody>
            {
              data
              ?.map((page) => page.docs)
              .flat()
              .filter(item => favorites.includes(item.id))
              .map(launch => {
                return (
                  <Box
                    cursor={"pointer"}
                    onClick={() => navigate(`/launches/${launch.id}`)}
                    boxShadow="md"
                    borderWidth="1px"
                    rounded="lg"
                    overflow="hidden"
                    position="relative"
                  >
              
                    <Box p="6">
                      <Box d="flex" alignItems="baseline">
                        {launch.success ? (
                          <Badge px="2" variant="solid" colorScheme="green">
                            Successful
                          </Badge>
                        ) : (
                          <Badge px="2" variant="solid" colorScheme="red">
                            Failed
                          </Badge>
                        )}
                        <Box
                          color="gray.500"
                          fontWeight="semibold"
                          letterSpacing="wide"
                          fontSize="xs"
                          textTransform="uppercase"
                          ml="2"
                        >
                          {launch.rocket?.name} &bull; {launch.launchpad?.name}
                        </Box>
                      </Box>
              
                      <Box
                        mt="1"
                        fontWeight="semibold"
                        as="h4"
                        lineHeight="tight"
                        isTruncated
                      >
                        {launch.name}
                      </Box>
                      <Flex>
                        <Text fontSize="sm">{formatDate(launch.date_utc)} </Text>
                        <Text color="gray.500" ml="2" fontSize="sm">
                          {timeAgo(launch.date_utc)}
                        </Text>
                      </Flex>
                      <Button
                        variant='ghost'
                        aria-label='Call Sage'
                        fontSize='15px'
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem("launches",launch.id);
                          setFavorites(getItems("launches"));
                        }}
                        right={0}
                        bottom={0}
                        margin={1}
                        position={"absolute"}
                      >Remove</Button>
                    </Box>
                  </Box>
                )
              }
              )
            }
          </DrawerBody>

          <DrawerFooter>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export function LaunchItem({ launch, isFavorite, onStarClick }) {
  const navigate = useNavigate();
  return (
    <Box
      cursor={"pointer"}
      onClick={() => navigate(`/launches/${launch.id}`)}
      boxShadow="md"
      borderWidth="1px"
      rounded="lg"
      overflow="hidden"
      position="relative"
    >
      <Image
        src={launch.links.flickr.original[0] ?? launch.links.patch.small}
        alt={`${launch.name} launch`}
        height={["200px", null, "300px"]}
        width="100%"
        objectFit="cover"
        objectPosition="bottom"
      />

      <Image
        position="absolute"
        top="5"
        right="5"
        src={launch.links.mission_patch_small}
        height="75px"
        objectFit="contain"
        objectPosition="bottom"
      />

      <Box p="6">
        <Box d="flex" alignItems="baseline">
          {launch.success ? (
            <Badge px="2" variant="solid" colorScheme="green">
              Successful
            </Badge>
          ) : (
            <Badge px="2" variant="solid" colorScheme="red">
              Failed
            </Badge>
          )}
          <Box
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
            ml="2"
          >
            {launch.rocket?.name} &bull; {launch.launchpad?.name}
          </Box>
        </Box>

        <Box
          mt="1"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          isTruncated
        >
          {launch.name}
        </Box>
        <Flex>
          <Text fontSize="sm">{formatDate(launch.date_utc)} </Text>
          <Text color="gray.500" ml="2" fontSize="sm">
            {timeAgo(launch.date_utc)}
          </Text>
          <IconButton
            variant='ghost'
            aria-label='Call Sage'
            fontSize='20px'
            colorScheme="yellow"
            onClick={(e) => {
              e.stopPropagation();
              onStarClick();
            }}
            right={0}
            bottom={0}
            margin={1}
            position={"absolute"}
            icon={<StarIcon fillOpacity={isFavorite ? 20 : 0} stroke={"black"}/>}
          />
        </Flex>
      </Box>
    </Box>
  );
}
